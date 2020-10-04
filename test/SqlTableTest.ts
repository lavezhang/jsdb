///<reference path="Assert.ts"/>
///<reference path="../src/SqlParser.ts"/>
console.log('----- unit tests for table -----');

Assert.runCase('create table', function () {
    let parser = new SqlParser("create table t_gender(id number,name varchar)");
    let node = parser.parseCreateTableNode(null);
    Assert.isTrue(node instanceof SqlCreateTableNode);

    let context = new SqlContext();
    let table = node.compute(context);

    Assert.isTrue(table instanceof SqlDataTable);
    Assert.isTrue(context.database.tables['t_gender'] != null);
    Assert.isEqual(context.database.tables['t_gender'].name, 't_gender');
    Assert.isEqual(context.database.tables['t_gender'].columnNames, ['id', 'name']);
});

Assert.runCase('table read/write', function () {
    let parser = new SqlParser("create table t_gender(id number,name varchar)");
    let node = parser.parseCreateTableNode(null);
    Assert.isTrue(node instanceof SqlCreateTableNode);

    let context = new SqlContext();
    let table = <SqlDataTable>node.compute(context);

    Assert.isEqual(table.name, 't_gender');
    Assert.isEqual(table.columnNames, ['id', 'name']);
    Assert.isEqual(table.rows.length, 0);

    Assert.isTrue(table.addRow([1, 'Male']) != null);
    Assert.isTrue(table.addRow(['2', 'Female']) != null);

    Assert.isEqual(table.rows.length, 2);
    Assert.isEqual(table.rows[0].values, [1, 'Male']);
    Assert.isEqual(table.rows[1].values, [2, 'Female']);

    //table.print();

    Assert.isEqual(table.getValueByIndex(0, 0), 1);
    Assert.isEqual(table.getValueByIndex(0, 1), 'Male');
    Assert.isEqual(table.getValueByName(1, 'id'), 2);
    Assert.isEqual(table.getValueByName(1, 'name'), 'Female');

    Assert.isTrue(table.setValueByIndex(0, 1, '男性'));
    Assert.isEqual(table.getValueByIndex(0, 1), '男性');

    Assert.isTrue(table.setValueByName(0, 'name', 'Male'));
    Assert.isEqual(table.getValueByName(0, 'name'), 'Male');

    table.deleteRow(0);
    Assert.isEqual(table.rows.length, 1);
    Assert.isEqual(table.rows[0].values, [2, 'Female']);
});