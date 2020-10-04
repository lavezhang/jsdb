/**
 * SQL分组值。
 */
class SqlGroupByValue {
    public value: number = null;
    public count: number = 0;  //辅助列：分组项的行数
    public sum: number = 0;  //辅助列：分组项的合计
    public distinctValues: number[] = [];  //辅助列：分组项的去重值
}