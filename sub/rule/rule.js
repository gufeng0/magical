const proxyName = "代理模式";

function main(params) {
  if (!params.proxies) return params;
  overwriteRules(params);
  overwriteProxyGroups(params);
  overwriteDns(params);
  return params;
}

const Regions = {
  HK: {
    code: "HK",
    name: "香港"
  },
  TW: {
    code: "TW",
    name: "台湾"
  },
  JP: {
    code: "JP",
    name: "日本"
  },
  US: {
    code: "US",
    name: "美国"
  },
  KR: {
    code: "KR",
    name: "韩国"
  }
};


const countryRegions = [
  { code: "HK", name: "香港", icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/hk.svg", regex: /(香港|HK|Hong Kong|🇭🇰)/i,flag:"🇭🇰" },
  // { code: "TW", name: "台湾", icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/tw.svg", regex: /(台湾|TW|Taiwan|🇹🇼)/i ,flag:"🇨🇳"},
  { code: "JP", name: "日本", icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/jp.svg", regex: /(日本|JP|Japan|🇯🇵)/i ,flag: "🇯🇵"},
  { code: "US", name: "美国", icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/us.svg", regex: /(美国|US|USA|United States|America|🇺🇸)/i,flag: "🇺🇸" },
  { code: "KR", name: "韩国", icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/flags/kr.svg", regex: /(韩国|KR|Korea|South Korea|🇰🇷)/i,flag: "🇰🇷" },
];

function getTestUrlForGroup(groupName) {
  switch (groupName) {
    case "Steam":
      return "https://store.steampowered.com/";
    case "Telegram":
      return "https://web.telegram.org/";
    case "ChatGPT":
      return "https://chat.openai.com/";
    case "Claude":
      return "https://claude.ai/";
    default:
      return "http://www.gstatic.com/generate_204";
  }
}

function getIconForGroup(groupName) {
  switch (groupName) {
    case "Steam":
      return "https://store.steampowered.com/favicon.ico";
    case "Telegram":
      return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/telegram.svg";
    case "ChatGPT":
      return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/chatgpt.svg";
    case "Claude":
      return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/claude.svg";
    case "漏网之鱼":
      return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg";
    case "广告拦截":
      return "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg";
    default:
      return "";
  }
}

function overwriteRules(params) {
  const rules = [
    "RULE-SET,steam,Steam",
    "RULE-SET,private,DIRECT",
    "RULE-SET,lancidr,DIRECT",
    "GEOIP,LAN,DIRECT,no-resolve",
    "RULE-SET,cncidr,DIRECT",
    "GEOIP,CN,DIRECT,no-resolve",
    "RULE-SET,applications,DIRECT",
    "RULE-SET,openai,ChatGPT",
    "RULE-SET,claude,Claude",
    "RULE-SET,telegramcidr,Telegram,no-resolve",
    "RULE-SET,apple," + proxyName,
    "RULE-SET,icloud," + proxyName,
    "RULE-SET,greatfire," + proxyName,
    "RULE-SET,reject,广告拦截",
    "RULE-SET,gfw," + proxyName,
    "RULE-SET,proxy," + proxyName,
    "RULE-SET,tld-not-cn," + proxyName,
    "MATCH,漏网之鱼",
  ];
  const ruleProviders = {
    steam: {
      type: "http",
      behavior: "classical",
      url: "https://raw.githubusercontent.com/yangtb2024/Steam-Clash/refs/heads/main/Steam.txt",
      path: "./ruleset/steam.yaml",
      interval: 86400,
    },
    reject: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/reject.txt",
      path: "./ruleset/reject.yaml",
      interval: 86400,
    },
    icloud: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/icloud.txt",
      path: "./ruleset/icloud.yaml",
      interval: 86400,
    },
    apple: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/apple.txt",
      path: "./ruleset/apple.yaml",
      interval: 86400,
    },
    proxy: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
      path: "./ruleset/proxy.yaml",
      interval: 86400,
    },
    openai: {
      type: "http",
      behavior: "classical",
      url: "https://fastly.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml",
      path: "./ruleset/custom/openai.yaml",
    },
    claude: {
      type: "http",
      behavior: "classical",
      url: "https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Claude/Claude.yaml",
      path: "./ruleset/custom/Claude.yaml",
    },
    telegramcidr: {
      type: "http",
      behavior: "ipcidr",
      url: "https://fastly.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
      path: "./ruleset/custom/telegramcidr.yaml",
    },
    private: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/private.txt",
      path: "./ruleset/private.yaml",
      interval: 86400,
    },
    gfw: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/gfw.txt",
      path: "./ruleset/gfw.yaml",
      interval: 86400,
    },
    greatfire: {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/greatfire.txt",
      path: "./ruleset/greatfire.yaml",
      interval: 86400,
    },
    "tld-not-cn": {
      type: "http",
      behavior: "domain",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/tld-not-cn.txt",
      path: "./ruleset/tld-not-cn.yaml",
      interval: 86400,
    },
    telegramcidr: {
      type: "http",
      behavior: "ipcidr",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/telegramcidr.txt",
      path: "./ruleset/telegramcidr.yaml",
      interval: 86400,
    },
    cncidr: {
      type: "http",
      behavior: "ipcidr",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/cncidr.txt",
      path: "./ruleset/cncidr.yaml",
      interval: 86400,
    },
    lancidr: {
      type: "http",
      behavior: "ipcidr",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/lancidr.txt",
      path: "./ruleset/lancidr.yaml",
      interval: 86400,
    },
    applications: {
      type: "http",
      behavior: "classical",
      url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/applications.txt",
      path: "./ruleset/applications.yaml",
      interval: 86400,
    },
  };
  
  params["rule-providers"] = ruleProviders;
  params["rules"] = rules;
}

function overwriteProxyGroups(params) {
  const allProxies = params["proxies"].map((e) => e.name);

  const autoProxyGroupRegexs = countryRegions.map(region => ({
    code: region.code,
    name: `${region.flag} ${region.code} - 自动选择`,
    regex: region.regex,
  }));

  const autoProxyGroupMap = autoProxyGroupRegexs.reduce((acc,item) => {
    acc.set(item.code, item);
    return acc;
  }, new Map());

  const autoProxyGroups = autoProxyGroupRegexs
    .map((item) => ({
      name: item.name,
      type: "url-test",
      url: "http://www.gstatic.com/generate_204",
      interval: 300,
      tolerance: 50,
      proxies: getProxiesByRegex(params, item.regex),
      hidden: false,
    }))
    .filter((item) => item.proxies.length > 0);

  const groups = [
    {
      name: proxyName, 
      type: "select",
      url: "http://www.gstatic.com/generate_204",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
      proxies: ["自动选择", "手动选择", "负载均衡 (散列)", "负载均衡 (轮询)", "DIRECT"],
    },
    
    {
      name: "手动选择", 
      type: "select", 
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/link.svg",
      proxies: allProxies, 
    },

    {
      name: "自动选择", 
      type: "url-test", 
      url: "http://www.gstatic.com/generate_204",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg",
      proxies: ["ALL - 自动选择", ...autoProxyGroupRegexs.map(group => group.name)],
      interval: 300,
      tolerance: 50, 
    },

    {
      name: "负载均衡 (散列)", 
      type: "load-balance", 
      url: "http://www.gstatic.com/generate_204",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg",
      interval: 300, 
      "max-failed-times": 3, 
      strategy: "consistent-hashing", 
      lazy: true, 
      proxies: allProxies, 
    },

    {
      name: "负载均衡 (轮询)", 
      type: "load-balance", 
      url: "http://www.gstatic.com/generate_204",
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg",
      interval: 300, 
      "max-failed-times": 3, 
      strategy: "round-robin", 
      lazy: true, 
      proxies: allProxies, 
    },

    {
      name: "ALL - 自动选择", 
      type: "url-test", 
      url: "http://www.gstatic.com/generate_204",
      interval: 300, 
      tolerance: 50, 
      proxies: allProxies, 
      hidden: false, 
    },

    {
      name: "ChatGPT",
      type: "url-test",
      url: getTestUrlForGroup("ChatGPT"),
      interval: 300,
      tolerance: 50,
      proxies: [autoProxyGroupMap.get(Regions.US.code).name],
      icon: getIconForGroup("ChatGPT"),
    },

    ...["Steam", "Telegram", "Claude"].map(groupName => ({
      name: groupName,
      type: "url-test",
      url: getTestUrlForGroup(groupName),
      interval: 300,
      tolerance: 50,
      proxies: [
        ...autoProxyGroupRegexs.map(group => group.name)
      ],
      icon: getIconForGroup(groupName),
    })),
    
    {
      name: "漏网之鱼", 
      type: "select", 
      proxies: ["DIRECT", proxyName], 
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/fish.svg",
    },

    {
      name: "广告拦截", 
      type: "select", 
      proxies: ["REJECT"], 
      icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/block.svg",
    },
  ];

  autoProxyGroups.push({
    name: "其它 - 自动选择",
    type: "url-test",
    url: "http://www.gstatic.com/generate_204",
    interval: 300,
    tolerance: 50,
    proxies: getProxiesByRegex(params, /(?!.*(?: 剩余 | 到期 | 主页 | 官网 | 游戏 | 关注))(.*)/),
    hidden: true,
  });
  
  groups.push(...autoProxyGroups);
  params["proxy-groups"] = groups;
}

function overwriteDns(params) {
  const cnDnsList = ["https://223.5.5.5/dns-query", "https://1.12.12.12/dns-query"];
  const trustDnsList = ["quic://dns.cooluc.com", "https://1.0.0.1/dns-query", "https://1.1.1.1/dns-query"];
  const dnsOptions = {
    enable: true,
    "prefer-h3": true,
    "default-nameserver": cnDnsList,
    nameserver: trustDnsList,
    "nameserver-policy": {
      "geosite:cn": cnDnsList,
      "geosite:geolocation-!cn": trustDnsList,
      "domain:google.com,facebook.com,youtube.com,twitter.com,github.com,cloudflare.com,jsdelivr.net,hf.space": trustDnsList,
    },
    fallback: trustDnsList,
    "fallback-filter": { geoip: true, "geoip-code": "CN", ipcidr: ["240.0.0.0/4"] },
  };
  const githubPrefix = "https://fastgh.lainbo.com/";
  const rawGeoxURLs = {
    geoip: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
    geosite: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
    mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
  };
  const accelURLs = Object.fromEntries(Object.entries(rawGeoxURLs).map(([key, githubUrl]) => [key, `${githubPrefix}${githubUrl}`]));
  const otherOptions = {
    "unified-delay": false,
    "tcp-concurrent": true,
    profile: { "store-selected": true, "store-fake-ip": true },
    sniffer: { enable: true, sniff: { TLS: { ports: [443, 8443] }, HTTP: { ports: [80, "8080-8880"], "override-destination": true } } },
    "geodata-mode": true,
    "geox-url": accelURLs,
  };
  params.dns = { ...params.dns, ...dnsOptions };
  Object.keys(otherOptions).forEach((key) => {
    params[key] = otherOptions[key];
  });
}

function getProxiesByRegex(params, regex) {
  const matchedProxies = params.proxies.filter((e) => regex.test(e.name)).map((e) => e.name);
  return matchedProxies.length > 0 ? matchedProxies : ["手动选择"];
}

function getManualProxiesByRegex(params, regex) {
  const matchedProxies = params.proxies.filter((e) => regex.test(e.name)).map((e) => e.name);
  return regex.test("CN") ? ["DIRECT", ...matchedProxies, "手动选择", proxyName] : matchedProxies.length > 0 ? matchedProxies : ["DIRECT", "手动选择", proxyName];
}
