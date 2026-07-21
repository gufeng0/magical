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
  overwriteRules(params);
  overwriteProxyGroups(params);
  overwriteDns(params);
  return params;
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

function overwriteDns(params) {
  const cnDnsList = [
    "https://223.5.5.5/dns-query",
    "https://1.12.12.12/dns-query",
  ];
  const trustDnsList = [
    "quic://dns.cooluc.com",
    "https://1.0.0.1/dns-query",
    "https://1.1.1.1/dns-query",
  ];
  const dnsOptions = {
    enable: true,
    "prefer-h3": true,
    "default-nameserver": cnDnsList,
    nameserver: trustDnsList,
    "nameserver-policy": {
      "geosite:cn": cnDnsList,
      "geosite:geolocation-!cn": trustDnsList,
      "domain:google.com,facebook.com,youtube.com,twitter.com,github.com,cloudflare.com,jsdelivr.net,hf.space":
        trustDnsList,
    },
    fallback: trustDnsList,
    "fallback-filter": {
      geoip: true,
      "geoip-code": "CN",
      ipcidr: ["240.0.0.0/4"],
    },
  };
  const githubPrefix = "https://fastgh.lainbo.com/";
  const rawGeoxURLs = {
    geoip:
      "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
    geosite:
      "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
  };
  const accelURLs = Object.fromEntries(
    Object.entries(rawGeoxURLs).map(([key, githubUrl]) => [
      key,
      `${githubPrefix}${githubUrl}`,
    ]),
  );
  const otherOptions = {
    "unified-delay": false,
    "tcp-concurrent": true,
    profile: { "store-selected": true, "store-fake-ip": true },
    sniffer: {
      enable: true,
      sniff: {
        TLS: { ports: [443, 8443] },
        HTTP: { ports: [80, "8080-8880"], "override-destination": true },
      },
    },
    "geodata-mode": true,
    "geox-url": accelURLs,
  };
  params.dns = { ...(params.dns || {}), ...dnsOptions };
  Object.assign(params, otherOptions);
}
