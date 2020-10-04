JSDB是基于JS（TypeScript）实现的一个轻量级关系型数据库，可以在浏览器中运行，通过JS执行SQL语句，满足前端WEB页面对数据的增、删、改、查需求。

JSDB是参照SQL92标准来实现的，但是只实现了最核心的一组功能，这些功能可以满足大部分需求。   如果你需要修改程序来引入新的特性，请严格遵守GPL协议。

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
更多的标准函数，等等。   

如果大家多多点赞，我将努力补齐。^_^
