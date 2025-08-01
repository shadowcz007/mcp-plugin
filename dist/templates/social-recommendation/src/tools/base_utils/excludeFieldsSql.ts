// 🔍 查询SQL: SELECT tag, tag_type, is_active FROM social_tag_wall WHERE user_id = 'shadow' AND device_id = 'm001' AND tag LIKE '%书友%' AND is_active = 1 ORDER BY update_time DESC LIMIT 3

//  excludeFields: ["user_id", "device_id"]

/**
 * 从SQL的WHERE子句中排除指定的字段条件
 * @param sql 原始SQL语句
 * @param excludeFields 需要排除的字段名数组
 * @returns 处理后的SQL语句
 */
export const excludeFieldsSql = (sql: string, excludeFields: string[]): string => {
    if (!sql || !excludeFields || excludeFields.length === 0) {
        return sql;
    }

    // 匹配WHERE子句，更精确地处理后续子句
    const whereMatch = sql.match(/WHERE\s+(.+?)(?=\s+ORDER\s+BY|\s+GROUP\s+BY|\s+HAVING|\s+LIMIT|\s*$)/i);
    if (!whereMatch) {
        return sql; // 没有WHERE子句，直接返回
    }

    const whereClause = whereMatch[1].trim();
    let newWhereClause = whereClause;

    // 为每个需要排除的字段构建正则表达式
    excludeFields.forEach(field => {
        // 匹配字段条件：field = value 或 field LIKE value 或 field IN (...) 等
        // 同时处理AND/OR连接符，更精确地匹配值部分
        const fieldPattern = new RegExp(
            `(\\s*(AND|OR)\\s+)?\\b${escapeRegExp(field)}\\s*(=|!=|<>|<|>|<=|>=|LIKE|NOT\\s+LIKE|IN|NOT\\s+IN)\\s*(?:'[^']*'|"[^"]*"|\\([^)]*\\)|[^\\s]+)`,
            'gi'
        );
        
        newWhereClause = newWhereClause.replace(fieldPattern, '');
    });

    // 清理多余的AND/OR连接符
    newWhereClause = cleanWhereClause(newWhereClause);

    // 如果WHERE子句被完全清空，移除整个WHERE部分
    if (!newWhereClause.trim()) {
        return sql.replace(/WHERE\s+.+?(?=\s+ORDER\s+BY|\s+GROUP\s+BY|\s+HAVING|\s+LIMIT|\s*$)/i, '').replace(/\s+/g, ' ').trim();
    }

    // 替换原SQL中的WHERE子句
    return sql.replace(whereMatch[0], `WHERE ${newWhereClause}`);
};

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 清理WHERE子句中多余的AND/OR连接符
 */
function cleanWhereClause(whereClause: string): string {
    let cleaned = whereClause
        // 移除开头的AND/OR
        .replace(/^\s*(AND|OR)\s+/i, '')
        // 移除结尾的AND/OR
        .replace(/\s+(AND|OR)\s*$/i, '')
        // 移除连续的AND/OR
        .replace(/\s+(AND|OR)\s+(AND|OR)\s+/gi, ' $2 ')
        // 移除多余空格
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned;
}