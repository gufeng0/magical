// Define the `main` function

const proxyName = "🛜代理模式";

function main(params) {
    if (!params.proxies) return params;
    overwriteRules(params);
    overwriteProxyGroups(params);
    overwriteDns(params);
    return params;
}
//覆写规则
function overwriteRules(params) {
    const rules = [
        "RULE-SET,reject,⛔广告拦截",
        // "RULE-SET,direct,DIRECT",
        "RULE-SET,cncidr,DIRECT",
        "RULE-SET,private,DIRECT",
        "RULE-SET,lancidr,DIRECT",
        "DOMAIN-SUFFIX,linux.do,DIRECT",
        "GEOIP,LAN,DIRECT,no-resolve",
        "GEOIP,CN,DIRECT,no-resolve",
        "RULE-SET,applications,DIRECT",
        "RULE-SET,tld-not-cn," + proxyName,
        "RULE-SET,google," + proxyName,
        "RULE-SET,icloud," + proxyName,
        "RULE-SET,apple," + proxyName,
        "RULE-SET,gfw," + proxyName,
        "RULE-SET,greatfire," + proxyName,
        "RULE-SET,telegramcidr," + proxyName,
        "RULE-SET,proxy," + proxyName,
        "MATCH,🐟漏网之鱼",
    ];
    const ruleProviders = {
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
        google: {
            type: "http",
            behavior: "domain",
            url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/google.txt",
            path: "./ruleset/google.yaml",
            interval: 86400,
        },
        proxy: {
            type: "http",
            behavior: "domain",
            url: "https://cdn.jsdelivr.net/gh/Loyalsoldier/clash-rules@release/proxy.txt",
            path: "./ruleset/proxy.yaml",
            interval: 86400,
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
//覆写代理组
function overwriteProxyGroups(params) {
    // 所有代理
    const allProxies = params["proxies"].map((e) => e.name);
    // 自动选择代理组，按地区分组选延迟最低
    const autoProxyGroupRegexs = [
        { name: "HK-自动选择", regex: /香港|HK|Hong|🇭🇰/ },
        { name: "TW-自动选择", regex: /台湾|TW|Taiwan|Wan|🇨🇳|🇹🇼/ },
        { name: "SG-自动选择", regex: /新加坡|狮城|SG|Singapore|🇸🇬/ },
        { name: "JP-自动选择", regex: /日本|JP|Japan|🇯🇵/ },
        { name: "US-自动选择", regex: /美国|US|United States|America|🇺🇸/ },
    ];

    const autoProxyGroups = autoProxyGroupRegexs
        .map((item) => ({
            name: item.name,
            type: "url-test",
            url: "http://www.gstatic.com/generate_204",
            interval: 300,
            tolerance: 50,
            proxies: getProxiesByRegex(params, item.regex),
            hidden: true,
        }))
        .filter((item) => item.proxies.length > 0);

    const groups = [
        {
            name: proxyName,
            type: "select",
            url: "http://www.gstatic.com/generate_204",
            //icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/adjust.svg",
            proxies: [
                "🤖自动选择",
                "🎯手动选择",
                "🔀负载均衡(散列)",
                "🔁负载均衡(轮询)",
                "DIRECT",
            ],
        },
        {
            name: "🎯手动选择",
            type: "select",
            proxies: allProxies,
        },
        {
            name: "🤖自动选择",
            type: "select",
            //icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/speed.svg",
            proxies: ["ALL-自动选择"],
        },
        {
            name: "🔀负载均衡(散列)",
            type: "load-balance",
            url: "http://www.gstatic.com/generate_204",
            //icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/balance.svg",
            interval: 300,
            "max-failed-times": 3,
            strategy: "consistent-hashing",
            lazy: true,
            proxies: allProxies,
        },
        {
            name: "🔁负载均衡(轮询)",
            type: "load-balance",
            url: "http://www.gstatic.com/generate_204",
            //icon: "https://fastly.jsdelivr.net/gh/clash-verge-rev/clash-verge-rev.github.io@main/docs/assets/icons/merry_go.svg",
            interval: 300,
            "max-failed-times": 3,
            strategy: "round-robin",
            lazy: true,
            proxies: allProxies,
        },
        {
            name: "ALL-自动选择",
            type: "url-test",
            url: "http://www.gstatic.com/generate_204",
            interval: 300,
            tolerance: 50,
            proxies: allProxies,
            // hidden: true,
        },
        {
            name: "🐟漏网之鱼",
            type: "select",
            proxies: ["DIRECT", proxyName],
        },
        {
            name: "⛔广告拦截",
            type: "select",
            proxies: ["REJECT", "DIRECT", proxyName],
        },
    ];

    autoProxyGroups.length &&
    groups[2].proxies.unshift(...autoProxyGroups.map((item) => item.name));
    groups.push(...autoProxyGroups);
    params["proxy-groups"] = groups;
}
//防止dns泄露
function overwriteDns(params) {
    const cnDnsList = [
        "https://223.5.5.5/dns-query",
        "https://1.12.12.12/dns-query",
    ];
    const trustDnsList = [
        'quic://dns.cooluc.com',
        "https://1.0.0.1/dns-query",
        "https://1.1.1.1/dns-query",
    ];
    const linuxdoDnsList = [
        'https://aaa.ddd.oaifree.com/query-dns',
    ];
    // const notionDns = 'tls://dns.jerryw.cn'
    // const notionUrls = [
    //     'http-inputs-notion.splunkcloud.com',
    //     '+.notion-static.com',
    //     '+.notion.com',
    //     '+.notion.new',
    //     '+.notion.site',
    //     '+.notion.so',
    // ]
    // const combinedUrls = notionUrls.join(',');
    const dnsOptions = {
        enable: true,
        "prefer-h3": true, // 如果DNS服务器支持DoH3会优先使用h3
        "default-nameserver": cnDnsList, // 用于解析其他DNS服务器、和节点的域名, 必须为IP, 可为加密DNS。注意这个只用来解析节点和其他的dns，其他网络请求不归他管
        nameserver: trustDnsList, // 其他网络请求都归他管

        // 这个用于覆盖上面的 nameserver
        "nameserver-policy": {
            //[combinedUrls]: notionDns,
            "geosite:cn": cnDnsList,
            "geosite:geolocation-!cn": trustDnsList,
            // 如果你有一些内网使用的DNS，应该定义在这里，多个域名用英文逗号分割
            // '+.公司域名.com, www.4399.com, +.baidu.com': '10.0.0.1'
            "+.linux.do": linuxdoDnsList,
        },
        fallback: trustDnsList,
        "fallback-filter": {
            geoip: true,
            //除了 geoip-code 配置的国家 IP, 其他的 IP 结果会被视为污染 geoip-code 配置的国家的结果会直接采用，否则将采用 fallback结果
            "geoip-code": "CN",
            //geosite 列表的内容被视为已污染，匹配到 geosite 的域名，将只使用 fallback解析，不去使用 nameserver
            geosite: ["gfw"],
            ipcidr: ["240.0.0.0/4"],
            domain: ["+.google.com", "+.facebook.com", "+.youtube.com"],
        },
    };

    // GitHub加速前缀
    const githubPrefix = "https://fastgh.lainbo.com/";

    // GEO数据GitHub资源原始下载地址
    const rawGeoxURLs = {
        geoip:
            "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geoip-lite.dat",
        geosite:
            "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/geosite.dat",
        mmdb: "https://github.com/MetaCubeX/meta-rules-dat/releases/download/latest/country-lite.mmdb",
    };

    // 生成带有加速前缀的GEO数据资源对象
    const accelURLs = Object.fromEntries(
        Object.entries(rawGeoxURLs).map(([key, githubUrl]) => [
            key,
            `${githubPrefix}${githubUrl}`,
        ])
    );

    const otherOptions = {
        "unified-delay": true,
        "tcp-concurrent": true,
        profile: {
            "store-selected": true,
            "store-fake-ip": true,
        },
        sniffer: {
            enable: true,
            sniff: {
                TLS: {
                    ports: [443, 8443],
                },
                HTTP: {
                    ports: [80, "8080-8880"],
                    "override-destination": true,
                },
            },
        },
        "geodata-mode": true,
        "geox-url": accelURLs,
    };

    params.dns = { ...params.dns, ...dnsOptions };
    Object.keys(otherOptions).forEach((key) => {
        params[key] = otherOptions[key];
    });
}

function getProxiesByRegex(params, regex) {
    return params.proxies.filter((e) => regex.test(e.name)).map((e) => e.name);
}
