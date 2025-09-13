
<?php


// ---------------------------显示文章最后修改时间----------------------------------
function display_last_modified_date() {
    if (is_single()) {
        $modified_date = get_the_modified_date('Y-m-d');
        $author = get_the_author();
        echo '<div class="last-modified-info">';
        echo '最后更新时间 ' . $modified_date;
        echo '</div>';
    }
}
add_action('astra_entry_content_after', 'display_last_modified_date');