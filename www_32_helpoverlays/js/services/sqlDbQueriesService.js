angular.module('starter.services')
.service('queries', function () {

return{
	FormData_table:function(){
	$cordovaSQLite.execute(db, 'CREATE TABLE IF NOT EXISTS FormData_table(uniqueID integer primary key autoincrement,FormId integer,userId integer ,FormValues text,FormStatus text,TaskId text)').then(function (res) {});
	}

}
});