const DEFAULT_TEST_URL = "http://www.gstatic.com/generate_204";
const HEALTH_CHECK_INTERVAL = 300;
const FALLBACK_CHECK_INTERVAL = 180;
const HEALTH_CHECK_TOLERANCE = 50;
const GROUP_NAMES = {
  proxy: "🚀 节点选择",
  auto: "♻️ 自动选择",
  fallback: "🔯 故障转移",
  loadBalance: "🔮 负载均衡",
  direct: "🎯 全球直连",
  reject: "🛑 全球拦截",
  final: "🐟 漏网之鱼",
  cloudflare: "☁️ CloudFlareCDN",
};

// 自定义规则优先级最高，分组支持 proxy、direct、reject 等简写。
const CUSTOM_RULES = [
  "DOMAIN-SUFFIX,linux.do,proxy",
  "DOMAIN-SUFFIX,anyrouter.top,proxy",
  "DOMAIN-SUFFIX,brew.sh,proxy",
  "DOMAIN-SUFFIX,netbird.io,proxy",
  "DOMAIN-SUFFIX,figma.com,proxy",
  "DOMAIN-SUFFIX,cc.cd,proxy",
  "DOMAIN-SUFFIX,mangabz.com,proxy",
  "DOMAIN-SUFFIX,greasyfork.org,proxy",
  "DOMAIN-SUFFIX,live.com,proxy",
];

const RULE_PROVIDER_INTERVAL = 86400;
const RULE_PROVIDER_BASE =
  "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release";

function main(params) {
  const hasValidProxy =
    params &&
    Array.isArray(params.proxies) &&
    params.proxies.some(
      (proxy) => proxy && typeof proxy.name === "string" && proxy.name,
    );
  if (!hasValidProxy) {
    return params;
  }
  overwriteBaseConfig(params);
  overwriteRules(params);
  overwriteProxyGroups(params);
  return params;
}

function overwriteBaseConfig(params) {
  const proxies = params.proxies;
  Object.keys(params).forEach((key) => delete params[key]);
  Object.assign(params, {
    dns: createDnsOptions(),
    port: 7890,
    "socks-port": 7891,
    "allow-lan": true,
    mode: "rule",
    "log-level": "info",
    "external-controller": "127.0.0.1:9090",
    proxies,
  });
}

function overwriteRules(params) {
  const G = GROUP_NAMES;
  const rules = [
    ...createCustomRules(),
    `RULE-SET,reject,${G.reject}`,
    `RULE-SET,private,${G.direct}`,
    `RULE-SET,lancidr,${G.direct}`,
    `RULE-SET,cncidr,${G.direct}`,
    "GEOIP,LAN,DIRECT,no-resolve",
    `GEOIP,CN,${G.direct},no-resolve`,
    `RULE-SET,applications,${G.direct}`,
    `RULE-SET,tld-not-cn,${G.proxy}`,
    `RULE-SET,google,${G.proxy}`,
    `RULE-SET,icloud,${G.proxy}`,
    `RULE-SET,apple,${G.proxy}`,
    `RULE-SET,gfw,${G.proxy}`,
    `RULE-SET,greatfire,${G.proxy}`,
    `RULE-SET,telegramcidr,${G.proxy}`,
    `RULE-SET,proxy,${G.proxy}`,
    `MATCH,${G.final}`,
  ];

  params["rule-providers"] = createRuleProviders();
  params.rules = rules;
}

function createRuleProviders() {
  const domainProviders = [
    "reject",
    "icloud",
    "apple",
    "google",
    "proxy",
    "private",
    "gfw",
    "greatfire",
    "tld-not-cn",
  ];
  const ipcidrProviders = ["telegramcidr", "cncidr", "lancidr"];
  const classicalProviders = ["applications"];

  const providers = {};

  for (const name of domainProviders) {
    providers[name] = createRuleProvider(name, "domain");
  }
  for (const name of ipcidrProviders) {
    providers[name] = createRuleProvider(name, "ipcidr");
  }
  for (const name of classicalProviders) {
    providers[name] = createRuleProvider(name, "classical");
  }

  return providers;
}

function createRuleProvider(name, behavior) {
  return {
    type: "http",
    behavior,
    url: `${RULE_PROVIDER_BASE}/${name}.txt`,
    path: `./ruleset/${name}.yaml`,
    interval: RULE_PROVIDER_INTERVAL,
  };
}

function createCustomRules() {
  return CUSTOM_RULES.map((rule) =>
    rule
      .split(",")
      .map((part) => GROUP_NAMES[part.trim()] || part)
      .join(","),
  );
}

function overwriteProxyGroups(params) {
  const allProxies = [
    ...new Set(
      params.proxies
        .map((proxy) => proxy && proxy.name)
        .filter((name) => typeof name === "string" && name),
    ),
  ];

  const finalProxies = [GROUP_NAMES.direct, GROUP_NAMES.proxy];
  const cloudflareProxies = [
    GROUP_NAMES.final,
    GROUP_NAMES.proxy,
    GROUP_NAMES.direct,
    GROUP_NAMES.auto,
    GROUP_NAMES.fallback,
    GROUP_NAMES.loadBalance,
    ...allProxies,
  ];

  const groups = [
    {
      name: GROUP_NAMES.proxy,
      type: "select",
      proxies: [
        GROUP_NAMES.auto,
        GROUP_NAMES.fallback,
        GROUP_NAMES.loadBalance,
        "DIRECT",
        ...allProxies,
      ],
    },
    createHealthCheckGroup(GROUP_NAMES.auto, "url-test", allProxies, {
      tolerance: HEALTH_CHECK_TOLERANCE,
    }),
    createHealthCheckGroup(GROUP_NAMES.fallback, "fallback", allProxies, {
      interval: FALLBACK_CHECK_INTERVAL,
    }),
    createHealthCheckGroup(
      GROUP_NAMES.loadBalance,
      "load-balance",
      allProxies,
      {
        interval: FALLBACK_CHECK_INTERVAL,
        strategy: "consistent-hashing",
      },
    ),
    {
      name: GROUP_NAMES.direct,
      type: "select",
      proxies: ["DIRECT", GROUP_NAMES.proxy, GROUP_NAMES.auto],
    },
    {
      name: GROUP_NAMES.reject,
      type: "select",
      proxies: ["REJECT", "DIRECT"],
    },
    {
      name: GROUP_NAMES.final,
      type: "select",
      proxies: finalProxies,
    },
    {
      name: GROUP_NAMES.cloudflare,
      type: "select",
      proxies: cloudflareProxies,
    },
  ];

  params["proxy-groups"] = groups;
}

function createHealthCheckGroup(name, type, proxies, options = {}) {
  const interval = options.interval || HEALTH_CHECK_INTERVAL;
  const restOptions = { ...options };
  delete restOptions.interval;
  return {
    name,
    type,
    url: DEFAULT_TEST_URL,
    interval,
    proxies,
    ...restOptions,
  };
}

function createDnsOptions() {
  return {
    enable: true,
    "default-nameserver": ["223.5.5.5", "119.29.29.29", "114.114.114.114"],
    "use-hosts": true,
    nameserver: [
      "https://sm2.doh.pub/dns-query",
      "https://dns.alidns.com/dns-query",
    ],
    fallback: ["8.8.4.4", "208.67.220.220"],
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4", "127.0.0.1/32", "0.0.0.0/32"],
      domain: ["+.google.com", "+.facebook.com", "+.youtube.com"],
    },
    "nameserver-policy": {
      "edt.hersmile.cc.cd": "https://dns.alidns.com/dns-query",
      "cloudflare-ech.com": "https://dns.alidns.com/dns-query",
    },
  };
}
