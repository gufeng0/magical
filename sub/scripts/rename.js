
function operator(proxies) {

    // 筛选低倍率节点
    proxies = filterLowProxy(proxies);

    return proxies;
}

// 筛选低倍率节点
function filterLowProxy(proxies) {
    return proxies.filter(proxy => proxy.name.includes('0.'));
}