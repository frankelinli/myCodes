---
author: haoye
categories:
- 随记
date: '2025-04-19T12:17:16'
id: 134
tags: []
title: WordPress图片相对地址
---

可以使用WordPress内置的函数`get_site_url()`来生成相对地址。修改图片标签如下：

    
    
    <img src="<?php echo get_site_url(); ?>/wp-content/uploads/2024/12/mpwechat.jpg" alt="微信公众号二维码">
    

这样无论是在本地环境还是生产环境，地址都会自动适配当前站点URL。使用相对地址是更好的做法，因为迁移网站时不需要手动修改地址。

