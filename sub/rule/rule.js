const DEFAULT_TEST_URL = "http://www.gstatic.com/generate_204";
const HEALTH_CHECK_INTERVAL = 300;
const HEALTH_CHECK_TOLERANCE = 50;
const RULE_UPDATE_INTERVAL = 86400;
const GROUP_NAMES = {
  proxy: "🚀 节点选择",
  auto: "♻️ 自动选择",
  fallback: "⚛️ 故障转移",
  loadBalance: "🔮 负载均衡",
  direct: "🎯 全球直连",
  reject: "🛑 全球拦截",
  final: "🐟 漏网之鱼",
};

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
  const rules = [
    `RULE-SET,reject,${GROUP_NAMES.reject}`,
    `RULE-SET,private,${GROUP_NAMES.direct}`,
    `RULE-SET,lancidr,${GROUP_NAMES.direct}`,
    `GEOIP,LAN,${GROUP_NAMES.direct},no-resolve`,
    `RULE-SET,cncidr,${GROUP_NAMES.direct}`,
    `GEOIP,CN,${GROUP_NAMES.direct},no-resolve`,
    `RULE-SET,applications,${GROUP_NAMES.direct}`,
    `RULE-SET,steam,${GROUP_NAMES.proxy}`,
    `RULE-SET,openai,${GROUP_NAMES.proxy}`,
    `RULE-SET,claude,${GROUP_NAMES.proxy}`,
    `RULE-SET,youtube,${GROUP_NAMES.proxy}`,
    `RULE-SET,telegramcidr,${GROUP_NAMES.proxy},no-resolve`,
    `RULE-SET,apple,${GROUP_NAMES.proxy}`,
    `RULE-SET,icloud,${GROUP_NAMES.proxy}`,
    `RULE-SET,greatfire,${GROUP_NAMES.proxy}`,
    `RULE-SET,gfw,${GROUP_NAMES.proxy}`,
    `RULE-SET,proxy,${GROUP_NAMES.proxy}`,
    `RULE-SET,tld-not-cn,${GROUP_NAMES.proxy}`,
    `MATCH,${GROUP_NAMES.final}`,
  ];
  const ruleProviders = {
    steam: createRuleProvider(
      "classical",
      "https://raw.githubusercontent.com/yangtb2024/Steam-Clash/refs/heads/main/Steam.txt",
      "./ruleset/steam.yaml",
    ),
    reject: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
      "./ruleset/reject.yaml",
    ),
    icloud: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
      "./ruleset/icloud.yaml",
    ),
    apple: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
      "./ruleset/apple.yaml",
    ),
    proxy: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
      "./ruleset/proxy.yaml",
    ),
    openai: createRuleProvider(
      "classical",
      "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
      "./ruleset/custom/openai.yaml",
    ),
    claude: createRuleProvider(
      "classical",
      "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml",
      "./ruleset/custom/Claude.yaml",
    ),
    youtube: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/snapei/clash-pro-rules@release/youtube.txt",
      "./ruleset/custom/youtube.yaml",
    ),
    telegramcidr: createRuleProvider(
      "ipcidr",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
      "./ruleset/telegramcidr.yaml",
    ),
    private: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
      "./ruleset/private.yaml",
    ),
    gfw: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
      "./ruleset/gfw.yaml",
    ),
    greatfire: createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt",
      "./ruleset/greatfire.yaml",
    ),
    "tld-not-cn": createRuleProvider(
      "domain",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
      "./ruleset/tld-not-cn.yaml",
    ),
    cncidr: createRuleProvider(
      "ipcidr",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
      "./ruleset/cncidr.yaml",
    ),
    lancidr: createRuleProvider(
      "ipcidr",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
      "./ruleset/lancidr.yaml",
    ),
    applications: createRuleProvider(
      "classical",
      "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
      "./ruleset/applications.yaml",
    ),
  };

  params["rule-providers"] = ruleProviders;
  params.rules = rules;
}

function createRuleProvider(behavior, url, path) {
  return {
    type: "http",
    behavior,
    url,
    path,
    interval: RULE_UPDATE_INTERVAL,
  };
}

function overwriteProxyGroups(params) {
  const allProxies = [
    ...new Set(
      params.proxies
        .map((proxy) => proxy && proxy.name)
        .filter((name) => typeof name === "string" && name),
    ),
  ];

  const groups = [
    {
      name: GROUP_NAMES.proxy,
      type: "select",
      proxies: [
        GROUP_NAMES.auto,
        GROUP_NAMES.fallback,
        GROUP_NAMES.loadBalance,
        ...allProxies,
        GROUP_NAMES.direct,
      ],
    },
    createHealthCheckGroup(GROUP_NAMES.auto, "url-test", allProxies, {
      tolerance: HEALTH_CHECK_TOLERANCE,
    }),
    createHealthCheckGroup(GROUP_NAMES.fallback, "fallback", allProxies),
    createHealthCheckGroup(
      GROUP_NAMES.loadBalance,
      "load-balance",
      allProxies,
      {
        strategy: "consistent-hashing",
        lazy: true,
        "max-failed-times": 3,
      },
    ),
    {
      name: GROUP_NAMES.direct,
      type: "select",
      proxies: ["DIRECT"],
    },
    {
      name: GROUP_NAMES.reject,
      type: "select",
      proxies: ["REJECT", "DIRECT"],
    },
    {
      name: GROUP_NAMES.final,
      type: "select",
      proxies: [GROUP_NAMES.direct, GROUP_NAMES.proxy],
    },
  ];

  params["proxy-groups"] = groups;
}

function createHealthCheckGroup(name, type, proxies, options = {}) {
  return {
    name,
    type,
    url: DEFAULT_TEST_URL,
    interval: HEALTH_CHECK_INTERVAL,
    proxies,
    ...options,
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
