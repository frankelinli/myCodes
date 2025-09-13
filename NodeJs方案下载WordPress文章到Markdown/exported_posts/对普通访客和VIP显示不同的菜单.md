---
id: 178
title: 对普通访客和VIP显示不同的菜单
date: '2025-04-21T08:29:43'
author: haoye
categories:
  - notes
tags: []
---

可以设置2个菜单吗？一个普通访客看到的，一个vip会员看到的。二者显示其一

可以，这个需求非常常见！你可以通过代码实现**同一位置（如主菜单/primary menu）根据用户是否为VIP显示不同的菜单**，即：

- 普通用户和游客看到“普通菜单”
- VIP会员用户看到“VIP菜单”

下面是**最简单、完全代码实现的方法**：

***

## 步骤

### 1. 创建两个菜单

- 后台 → 外观 → 菜单
- 新建一个菜单，比如叫“普通菜单”（slug为`main`），设置为主题的“主菜单”(Primary)。
- 再新建一个菜单，比如叫“VIP菜单”（slug为`vip-main`），不用分配到位置（或也可设为主菜单，后面代码会覆盖）。

记住菜单的“**菜单名称**”或“**菜单别名(slug)**”，比如 `main` 和 `vip-main`。

***

### 2. 在`functions.php`添加如下代码

php

复制

```
add_filter('wp_nav_menu_args', function($args) {
    // 只针对主菜单（theme_location为'primary'），可根据主题自定义
    if (isset($args['theme_location']) && $args['theme_location'] === 'primary') {
        $user = wp_get_current_user();
        $is_vip = is_user_logged_in() && in_array('vip_member', (array)$user->roles);

        if ($is_vip) {
            // VIP会员显示VIP菜单（菜单slug为vip-main）
            $args['menu'] = 'vip-main'; // 填写你的VIP菜单slug
        } else {
            // 普通用户显示普通菜单（菜单slug为main）
            $args['menu'] = 'main'; // 填写你的普通菜单slug
        }
    }
    return $args;
});
```

> **说明：**
>
> - `theme_location` 一般为`primary`，不同主题可能有不同名字，如 `main-menu`、`header`。\
>   可在主题代码中查找 `wp_nav_menu(['theme_location' => ...])` 得知。
> - `menu` 填菜单**别名(slug)\**或\**&#x83DC;单ID**，后台菜单页面有显示。

***

### 3. 效果

- 当**VIP会员**访问，主菜单自动切换到“VIP菜单”
- 当**普通会员或游客**访问，主菜单显示“普通菜单”

**其它菜单位置不受影响！**

***

## 进阶补充

- 如果你的主题并非用 `primary` 作为主菜单位置，请将 `theme_location === 'primary'` 换成你的主题实际名字。

- 如果你想用菜单ID，也可以设置：

php

复制

`$args['menu'] = 42; // 用菜单ID`

***

## 总结

- **简单、纯代码、无需插件**
- 菜单内容灵活由后台可视化编辑
- 只需复制粘贴即可实现

如需同时控制多个菜单位置、不同用户类型（如SVIP/管理员/特定用户），也可以继续问我！
