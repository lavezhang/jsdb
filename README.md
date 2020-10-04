JSDB is a lightweight relational database based on JS (typescript).    
It can run in the web browser and execute SQL statements through JS for web application's basic needs.

JSDB is implemented according to the SQL92 standard, but only the core set of functions, which can meet most of the requirements.     
If you need to modify the source code to add some new features, please follow the GPL protocol strictly.    

The main implemented features:    

create table   
insert   
update   
delete   
select / distinct / from / join / left join / where / group by / having / order by / limit    
+、-、*、/、%、>、>=、<、<=、=、<>、like、is、between、and、or、not、?   

The built-in standard functions only implement: ifnull, len, substr, substring, instr, concat.    
If you need to add new standard functions, you can implement it in the SqlContext.ts file, and all the standard functions must be registered in SqlContext.standardFunctions Field.

The main functions that have not been implemented are:    

with / sub query / exists / alter / truncate   
transaction/commit/rollback   
... 

The more you praise me, the more functions I will implement.


-----------------------------------------------------------------------


JSDB是基于JS（TypeScript）实现的一个轻量级关系型数据库，可以在浏览器中运行，通过JS执行SQL语句，满足前端WEB页面对数据的增、删、改、查需求。

JSDB是参照SQL92标准来实现的，但是只实现了最核心的一组功能，这些功能可以满足大部分需求。   
如果你需要修改程序来引入新的特性，请严格遵守GPL协议。

目前已经实现的SQL特性主要有：   

create table   
insert   
update   
delete   
select / distinct / from / join / left join / where / group by / having / order by / limit    
+、-、*、/、%、>、>=、<、<=、=、<>、like、is、between、and、or、not、?   

内置的标准函数只实现了：ifnull、len、substr、substring、instr、concat。      
如果需要增加新的标准函数，可以在SqlContext类的构造函数中实现，所有的标准函数都注册到SqlContext.standardFunctions字段中。

尚未实现的功能主要有：    

with / sub query / exists / alter / truncate   
transaction/commit/rollback   
... 

如果大家多多点赞，我将努力补齐。^_^

-----------------------------------------------------------------------

几个范例SQL如下所示：    

------------demo1--------------
```sql
SELECT
    s.id,
    s.name,
    ifnull(s.gender, '--') AS gender_id, /*处理空值*/
    (CASE g.name WHEN 'Male' THEN '男' WHEN 'Female' THEN '女' ELSE '未知' END) AS gender_name,
    s.dept_id,
    d.dept_name
FROM t_staff s
LEFT JOIN t_gender g ON g.id=s.gender
LEFT JOIN t_dept d ON d.dept_id=s.dept_id
WHERE d.dept_name IS NOT NULL
LIMIT 3
```
------------demo2--------------
```sql
SELECT
  s.gender,
  count(*)
FROM t_staff s
GROUP BY s.gender
HAVING COUNT(*) > 1
```
------------demo3--------------
```sql
SELECT
  d.dept_name,
  count(*)
FROM t_staff s
LEFT JOIN t_dept d ON d.dept_id=s.dept_id
WHERE d.dept_name IS NOT NULL
GROUP BY d.dept_name
ORDER BY count(*)
```

