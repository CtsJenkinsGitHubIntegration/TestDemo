var express = require('express');
var sessions = require('client-sessions');
var app = express();
var path = require('path'); //Use the path to tell where find the .ejs files
var fs = require("fs");
//var SQL = require('sql.js');
var https = require('https');
var settings = require('settings');
var search = require('netsuite-search')(settings);
var pg = require('pg');
var async = require('async');
var dbs = require('db_abstraction.js');
var dt = require('date_format.js');
dbs.db('POSTGRESS');
var id=null;
var vendor_name=null;
var gl_ack = null;
var gl_pl = null;
var notdata = new Array();
//var notification_flag = null;
var count = 0;

app.set('port', (process.env.PORT || 5000));

app.use(require('body-parser').urlencoded({
    extended: true
}));

app.use(sessions({
cookieName:'session',
secret:'sdsfsfdfdsgfrh34t',
duration:30*60*1000,
activeDuration:5*60*1000,
httpOnly:true,
secure:true,ephemeral:true
}));

app.use(function(req,res,next){
	if(req.session && req.session.user){
		console.log('req.session.user.vendor_ns_id  -->' + req.session.user[0].vendor_ns_id );
		console.log('req.session.user --> ' + req.session.user);
		console.log('Json Format req.session.user -->' + JSON.stringify(req.session.user));
		var fields_vendor_login= {key:"vendor_ns_id::integer",operator:"=",value:req.session.user[0].vendor_ns_id};
				dbs.query('vendor_master',fields_vendor_login);
				dbs.readData(function (result){
				console.log("result vendor_master count :: "+ result.length);
				if(result.length!=0)
				{
					
						req.user = result;
						req.session.user = req.user;
						res.locals.user = req.user;
						
						//res.redirect(303,'dashboard?vendorid='+vendorid);
			  		
				}
				next();
				});
	}
	else{
		next();
	}
});

function requireLogin(req,res,next){
	if(!req.user){
		res.redirect(303,'login');
	}
	else{
		next();
	}
}

var formidable = require('formidable');


// view engine setup
app.set('views', __dirname + '/views'); // here the .ejs files is in views folders
app.set('view engine', 'ejs'); //tell the template engine


app.use( express.static(__dirname + '/public' ) );

var router = express.Router();

app.get('/', function(req,res,next){
	console.log('in index get ejs');
	
	res.render('index',{});
});

/* Preferences Page */
app.get('/preferences', function(req,res,next){
	console.log('in preference get ejs');
	
	res.render('preferences',{});
});

/* Read More Page */
app.get('/readmore', function(req,res,next){
	console.log('in read more get ejs');
	
	res.render('readmore',{});
});

/*GET home page*/
/*app.get('/index', function(req,res,next){
	console.log('in index get ejs');
	
	res.render('index',{});
});*/


/* GET home page. */
app.get('/dashboard', requireLogin, function(req, res, next) { // route for '/'

if(req.query.vendorid)
{

	console.log("Dashboard page ");
	//console.log("vendor_name  "+req.params.vendorid);
	console.log("vendor_name  "+req.query.vendorid);  
	id=req.query.vendorid;
	
	notdata = req.query.notdata;
	count = req.query.count; 
	
	var po_all_count = 0;
	var po_pendingAck_count = 0;
	var po_Ack_count = 0;
	var po_pendingDelivery_count = 0;
	var po_pendingBill_count = 0;
	var po_fully_billed_count=0;
	
	var pl_readyToShip_count = 0;
	var pl_shipped_count = 0;
	var bill_all_count = 0;
	
	dbs.db('POSTGRESS');
	
	var fields_vendormaster_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('vendor_master',fields_vendormaster_details);
	dbs.readData(function (result){
		console.log("result vendor details :: "+ result);
		
		first_name_val = result[0].first_name;
		last_name_val = result[0].last_name;

		console.log("first_name_val "+first_name_val);
		console.log("last_name_val "+last_name_val);		
	
		vendor_name= first_name_val+' '+last_name_val; 
		console.log("vendor_name "+vendor_name);
		
		//po_pendingAck_count = result;
	});
	
	var fields_po_pendingAck= {key:"order_status",operator:"=",value:"'Pending Acknowledge'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_pendingAck);
	dbs.readData(function (result){
		console.log("result po_pendingAck :: "+ result.length);
		po_pendingAck_count = result.length;
	});
	
	var fields_po_Ack= {key:"order_status",operator:"=",value:"'Acknowledged'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_Ack);
	dbs.readData(function (result){
		console.log("result po_Ack :: "+ result.length);
		po_Ack_count = result.length;
	});
	
	var fields_po_pendingDelivery= {key:"order_status",operator:"=",value:"'Pending Delivery'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_pendingDelivery);
	dbs.readData(function (result){
		console.log("result po_pendingDelivery_count :: "+ result.length);
		po_pendingDelivery_count = result.length;
	});
	
	var fields_po_pendingBill= {key:"order_status",operator:"=",value:"'Pending Billing'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_pendingBill);
	dbs.readData(function (result){
		console.log("result po_pendingBill_count :: "+ result.length);
		po_pendingBill_count = result.length;
	});
	
	var fields_po_fully_billed= {key:"order_status",operator:"=",value:"'Fully Billed'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_fully_billed);
	//var a = new dbs.field("order_status",'Fully Billed',"=");
	//var b = new dbs.field("order_status",'Fully Billed',"=");
	dbs.readData(function (result){
		console.log("result po_fully_billed_count :: "+ result.length);
		po_fully_billed_count = result.length;
	});
	
	var fields_pl_readyToShip= {key:"status",operator:"=",value:"'Ready to Ship'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_pl_readyToShip);
	dbs.readData(function (result){
		console.log("result pl_readyToShip_count :: "+ result.length);
		pl_readyToShip_count = result.length;
	});
	
	var fields_pl_shipped= {key:"status",operator:"=",value:"'Shipped'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_pl_shipped);
	dbs.readData(function (result){
		console.log("result pl_shipped_count :: "+ result.length);
		pl_shipped_count = result.length;
	});
	
	var fields_bill_list= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_list',fields_bill_list);
	dbs.readData(function (result){
		console.log("result bill_all_count :: "+ result.length);
		bill_all_count = result.length;
	});
	
	var fields_purchase_order_all= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('purchase_order',fields_purchase_order_all);
	dbs.readData(function (result){
		console.log("result PO all :: "+ result.length);
		po_all_count = result.length;
	});
	
	//console.log('Outside value for last var : ' + po_all_count);
	setTimeout(function () {
	res.render('dashboard', { //render the index.ejs
	vendorname:vendor_name,
	v_id:id,
	
	notdata_rend:notdata,
	count_rend:count,	
		
	po_all_count_rend:po_all_count,
	po_pendingAck_count_rend:po_pendingAck_count,
	po_Ack_count_rend:po_Ack_count,
	po_pendingDelivery_count_rend:po_pendingDelivery_count,
	po_pendingBill_count_rend:po_pendingBill_count,
	po_fully_billed_count_rend:po_fully_billed_count,
	
	pl_readyToShip_count_rend:pl_readyToShip_count,
	pl_shipped_count_rend:pl_shipped_count,
	bill_all_count_rend:bill_all_count
  
  }); 
		
	}, 5000);
	console.log("***** Get Index END ****** ");
}
else
{
	res.render('signout',{});
}


});

var server = app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

app.get('/login', function(req,res,next){
	
	console.log('in login get ejs');
/*
	var query76 = "Alter table purchase_order add column shipment_origin varchar";
	var f76 = {query:query76};
	dbs.query('purchase_order',f76);
	dbs.update();
	
	var query10 = "Update timestamp set rec_type = 'PurchaseOrder',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='7223' where rec_type = 'PurchaseOrder' and vendor_ns_id='7223'";
	var f10 = {query:query10};
	dbs.query('timestamp',f10);
	dbs.update();
	var query76 = "Alter table po_lines add column supplier_reference varchar";
	var f76 = {query:query76};
	dbs.query('po_lines',f76);
	dbs.update();
	var query12 = "ALTER TABLE packing_list_lines ALTER COLUMN description TYPE varchar,ALTER COLUMN item_name TYPE varchar" ;
	var f12 = {query:query12};
	dbs.query('packing_list_lines',f12);
	dbs.update()
	var query9 = "DELETE FROM timestamp WHERE vendor_ns_id = '5823' and rec_type = 'ItemReceipt'";
	var f9 = {query:query9};
	dbs.query('timestamp',f9);
	dbs.update();
	var query11 = "DELETE FROM item_receipt_lines WHERE vendor_ns_id = '5823'";
	var f11 = {query:query11};
	dbs.query('item_receipt_lines',f11);
	dbs.update();	
	var query10 = "Update timestamp set rec_type = 'ItemReceipt',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='5823' where rec_type = 'ItemReceipt' and vendor_ns_id='5823'";
	var f10 = {query:query10};
	dbs.query('timestamp',f10);
	dbs.update();
	var query75 = "ALTER TABLE packing_list DROP CONSTRAINT packing_list_pkey";
	var f75 = {query:query75};
	dbs.query('packing_list',f75);
	dbs.update();
	var query11 = "DELETE FROM item_receipt_lines WHERE vendor_ns_id = '5823'";
	var f11 = {query:query11};
	dbs.query('item_receipt_lines',f11);
	dbs.update();
	
	var query9 = "DELETE FROM timestamp WHERE vendor_ns_id = '1413'";
	var f9 = {query:query9};
	dbs.query('timestamp',f9);
	dbs.update();
	
	var query12 = "ALTER TABLE timestamp ALTER COLUMN timestamp TYPE varchar" ;
	var f12 = {query:query12};
	dbs.query('timestamp',f12);
	dbs.update()
	
	var query76 = "Alter table vendor_master add column date_created date";
	var f76 = {query:query76};
	dbs.query('vendor_master',f76);
	dbs.update();
	
	var query11 = "DELETE FROM bill_list WHERE vendor_ns_id = '1413'";
	var f11 = {query:query11};
	dbs.query('bill_list',f11);
	dbs.update();
	var query9 = "DELETE FROM bill_list_lines WHERE vendor_ns_id = '1413'";
	var f9 = {query:query9};
	dbs.query('bill_list_lines',f9);
	dbs.update();
	
	var query76 = "Alter table bill_payment drop column bill_id";
	var f76 = {query:query76};
	dbs.query('bill_payment',f76);
	dbs.update();
	
	var query77 = "Alter table bill_payment_lines add column bill_id integer";
	var f77 = {query:query77};
	dbs.query('bill_payment_lines',f77);
	dbs.update();
	
	
*/	


/*
	var query11 = "INSERT INTO timestamp VALUES('BillPayment','06/01/2016 10:15 PM','06/02/2016 10:45:16','1413')";
	var f11 = {query:query11};
	dbs.query(null,f11);
	dbs.update();
	
	var query78 = "Create table bill_payment_lines (bill_payment_id integer references bill_payment(ns_id) ,type varchar(20),original_amt real,amount_due real,date_due date,payment real,disc_date date,disc_avail real,disc_taken real,vendor_ns_id varchar(20) references vendor_master(vendor_ns_id))";
	var f78 = {query:query78};
	dbs.query(null,f78);
	dbs.update();
	var query77 = "Create table bill_payment (ns_id integer Primary Key,ns_ext_id integer,transaction_number varchar(60),payee varchar(60),amount real, created_date date,bill_id integer,currency varchar(20),memo varchar(60),vendor_ns_id varchar(20) references vendor_master(vendor_ns_id))";
	var f77 = {query:query77};
	dbs.query(null,f77);
	dbs.update();
	
	var query11 = "INSERT INTO timestamp VALUES('ItemReceipt','06/01/2016 10:15 PM','06/02/2016 10:45:16','4219')";
	var f11 = {query:query11};
	dbs.query(null,f11);
	dbs.update();
	
	var query10 = "INSERT INTO timestamp VALUES('Bills','06/01/2016 10:15 PM','06/02/2016 10:45:16','3418')";
	var f10 = {query:query10};
	dbs.query(null,f10);
	dbs.update();
	
	var query11 = "INSERT INTO timestamp VALUES('ItemReceipt','06/01/2016 10:15 PM','06/02/2016 10:45:16','3418')";
	var f11 = {query:query11};
	dbs.query(null,f11);
	dbs.update();
	
	var query10 = "Update timestamp set rec_type = 'PurchaseOrder',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='4119' where rec_type = 'PurchaseOrder' and vendor_ns_id='4119'";
	var f10 = {query:query10};
	dbs.query(null,f10);
	dbs.update();
	
	var query9 = "DELETE FROM po_lines WHERE vendor_ns_id = '3418'";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	
	
	var query10 = "INSERT INTO timestamp VALUES('PurchaseOrder','06/01/2016 10:15 PM','06/02/2016 10:45:16','3418')";
	var f10 = {query:query10};
	dbs.query(null,f10);
	dbs.update();
	
	var query11 = "INSERT INTO timestamp VALUES('PurchaseOrder','06/01/2016 10:15 PM','06/02/2016 10:45:16','1413')";
	var f11 = {query:query11};
	dbs.query(null,f11);
	dbs.update();
	
	
	
	var query9 = "DELETE FROM timestamp WHERE rec_type = 'PurchaseOrder'";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	
	var query9 = "Update timestamp set rec_type = 'PurchaseOrder',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='1413' where rec_type = 'PurchaseOrder' and vendor_ns_id='1413'";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	
	*/
	/*
	
	var query11 = "Update timestamp set rec_type = 'PurchaseOrder',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='1413' where rec_type = 'PurchaseOrder'";
	var f11 = {query:query11};
	dbs.query(null,f11);
	dbs.update();
*/	
//	DELETE FROM timestamp WHERE rec_type = 'PurchaseOrder';
	/*
	
	var query76 = "Alter table purchase_order drop column response_status,drop column timestamp";
	var f76 = {query:query76};
	dbs.query(null,f76);
	dbs.update();
	
	var query77 = "Alter table po_lines drop column item_status";
	var f77 = {query:query77};
	dbs.query(null,f77);
	dbs.update();
	
	var query76 = "Alter table bill_list add column po_ns_id varchar(20)";
	var f76 = {query:query76};
	dbs.query(null,f76);
	dbs.update();
	
	
	var query9 = "Update timestamp set rec_type = 'Bills',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='1413' where rec_type = 'Bills'";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	*/
	/*
	var delquerypl = "DELETE FROM bill_list";
	var f72 = {query:delquerypl};
	dbs.query(null,f72);
	dbs.update();
	
	var delquerypl = "DELETE FROM bill_list_lines";
	var f72 = {query:delquerypl};
	dbs.query(null,f72);
	dbs.update();
	*/
	/*var query9 = "INSERT INTO \"timestamp\" VALUES('ItemReceipt','06/01/2016 10:15 PM','06/02/2016 10:45:16','1413')";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	
	var query75 = "ALTER TABLE vendor_master ALTER COLUMN phone DROP NOT NULL,ALTER COLUMN address DROP NOT NULL";
	var f75 = {query:query75};
	dbs.query(null,f75);
	dbs.update();
	
	var query76 = "Alter table vendor_master add column delivery_method varchar(10),add column contact_name varchar(50),add column isperson varchar(20),add column contact_phone varchar(20)";
	var f76 = {query:query76};
	dbs.query(null,f76);
	dbs.update();
	*/
	/*
	var query9 = "Update timestamp set rec_type = 'ItemReceipt',timestamp='06/01/2016 10:15 PM',local_time='06/02/2016 10:45:16',vendor_ns_id='1413' where rec_type = 'ItemReceipt'";
	var f9 = {query:query9};
	dbs.query(null,f9);
	dbs.update();
	
	var delquerypl = "DELETE FROM packing_list";
	var f72 = {query:delquerypl};
	dbs.query(null,f72);
	dbs.update();
		
	var delquerypll = "DELETE FROM packing_list_lines";
	var f73 = {query:delquerypll};
	dbs.query(null,f73);
	dbs.update();
	
	var delqueryir = "DELETE FROM item_receipt";
	var f74 = {query:delqueryir};
	dbs.query(null,f74);
	dbs.update();
		
	var delqueryirl = "DELETE FROM item_receipt_lines";
	var f75 = {query:delqueryirl};
	dbs.query(null,f75);
	dbs.update();
	
	var delquerytbl = "DROP TABLE item_receipt, item_receipt_lines";
	var f74 = {query:delquerytbl};
	dbs.query(null,f74);
	dbs.update();
	*/
	
	/*var updateQuery = "ALTER TABLE packing_list_lines ALTER COLUMN item_name TYPE varchar(80),ALTER COLUMN description TYPE varchar(100)";
	var f11 = {query:updateQuery};
	dbs.query('packing_list_lines',f11);
	dbs.update();
	console.log("Update packing_list_lines");
	var query67 = "Create table item_receipt (ns_id integer Primary Key,ns_ext_id integer,created_date date,purchase_order_ext_id varchar(20),purchase_order_id integer,currency varchar(20),memo varchar(60),vendor_ns_id varchar(20) references vendor_master(vendor_ns_id))";
	var f67 = {query:query67};
	dbs.query('item_receipt',f67);
	dbs.update();
	console.log("Update item_receipt");
	var query68 = "Create table item_receipt_lines (item_receipt_id integer references item_receipt(ns_id) ,item_id varchar(20),quantity_received integer,item_name varchar(255),vendor_prod_name varchar(255),vendor_ns_id varchar(20) references vendor_master(vendor_ns_id))";
	var f68 = {query:query68};
	dbs.query('item_receipt_lines',f68);
	dbs.update();
	console.log("Update item_receipt_lines");
	
	var query70 = "Alter table vendor_master add column company_name varchar(60),add column currency varchar(20),add column shipment_origin varchar(20),add column shipping_point varchar(30),add column delivery_lead_time integer,add column exfactory_lead_time integer,add column terms varchar(60),add column incoterm varchar(30),add column security_question varchar(120),add column security_answer varchar(50)";
	var f70 = {query:query70};
	dbs.query('vendor_master',f70);
	dbs.update();
	console.log("Update vendor_master 1");
	
	var query71 = "Alter table vendor_master add column delivery_method varchar(10),add column contact_name varchar(50),add column contact_email varchar(255),add column contact_phone varchar(20)";
	var f71 = {query:query71};
	dbs.query('vendor_master',f71);
	dbs.update();
	console.log("Update vendor_master 2");
	
	var query72 = "Alter table vendor_master add column datecreated varchar(60)";
	var f72 = {query:query72};
	dbs.query('vendor_master',f72);
	dbs.update();
	console.log("Update vendor_master 3");
	*/
	/*var query1 = "CREATE TABLE vendor_master"+
						"("+
						"vendor_ns_id varchar(20) Primary Key,"+
						"first_name varchar(20),"+
						"last_name varchar(20),"+
						"email_id varchar(255) NOT NULL,"+
						"phone varchar(20) NOT NULL,"+
						"address varchar(255) NOT NULL,"+
						"password varchar(20) NOT NULL,"+
						"alt_phone varchar(20),"+
						"fax varchar(20)"+
						")";
	var f1 = {query:query1};
	dbs.query('vendor_master',f1);
	dbs.update();
	console.log("Vendor Master Created");
	
	var query2  = "CREATE TABLE purchase_order"+
						"("+
						"PO_NS_ID INTEGER,"+
						"TRAN_DATE DATE,"+
						"PO_NUMBER VARCHAR(20),"+
						"CURRENCY VARCHAR(20),"+
						"MEMO VARCHAR(255),"+
						"ACK_DATE DATE,"+
						"EX_FACTORY_DATE DATE,"+
						"WH_ARRIVAL_DATE DATE,"+
						"DATE_CREATED DATE,"+
						"DELIVERY_METHOD VARCHAR(20),"+
						"SHIPPING_POINT VARCHAR(20),"+
						"SHIPPING_TERMS VARCHAR(20),"+
						"SHIP_TO VARCHAR(20),"+
						"ORDER_STATUS VARCHAR(20),"+
						"RESPONSE_STATUS VARCHAR(20),"+
						"TIMESTAMP INTEGER,"+
						"total real,"+
						"tax_total real,"+
						"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
						")";
		var f2 = {query:query2};
		dbs.query('purchase_order',f2);
		dbs.update();
	console.log("Purchase Order Created");
	
	
	var query3 = "CREATE TABLE packing_list_lines"+
						"("+
						"PACKING_LIST_NS_ID INTEGER,"+
						"ITEM_ID VARCHAR(20),"+
						"ITEM_NAME VARCHAR(20),"+
						"DESCRIPTION VARCHAR(20),"+
						"QTY_ORDERED INTEGER,"+
						"QTY_DISPATCHED INTEGER,"+
						"PO_NS_ID INTEGER,"+
						"NET_WT DECIMAL,"+
						"GROSS_WT DECIMAL,"+
						" packinglist_ref varchar(20),"+
						" REF_PO_NUM varchar(20),"+
						"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
						")";
	var f3 = {query:query3};
	dbs.query('packing_list_lines',f3);
	dbs.update();
	console.log("Packing List Lines Created");
	
	var query4  = "CREATE TABLE timestamp"+
					"("+
					"rec_type varchar(20),"+
					"timestamp varchar(20),"+
					"local_time varchar(20),"+
					"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
					")";
	var f4 = {query:query4};
	dbs.query('purchase_order',f4);
	dbs.update();
	console.log("Timestamp  Created");
	
	var query5 = "CREATE TABLE bill_list"+
					"("+
					"BILL_LIST_NS_ID INTEGER,"+
					"AMOUNT DECIMAL,"+
					"BILL_DATE DATE,"+
					"MEMO VARCHAR(20),"+
					" Status VARCHAR(25),"+
					" po_id varchar(20),"+
					"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
					")"; 
	var f5 = {query:query5};
	dbs.query('bill_list',f5);
	dbs.update();
	console.log("Bill List Created");
	
	var query6 = "CREATE TABLE bill_list_lines"+
						"("+
						"BILL_LIST_NS_ID INTEGER,"+
						"ITEM_ID VARCHAR(20),"+
						"ITEM_NAME VARCHAR(255),"+
						"DESCRIPTION VARCHAR(255),"+
						"QUANTITY INTEGER,"+
						"AMOUNT DECIMAL,"+
						"TAX_AMOUNT DECIMAL,"+
						"TOTAL_AMOUNT DECIMAL,"+
						"GROSS_WT DECIMAL,"+
						"PO_NS_ID INTEGER,"+
						"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
						")"
	var f6 = {query:query6};
	dbs.query('bill_list_lines',f6);
	dbs.update();
	console.log("Bill List Lines Created");
	
	var query7 = "CREATE TABLE po_lines"+
					"("+
					"ITEM_ID VARCHAR(20),"+
					"ITEM_NAME VARCHAR(255),"+
					"PO_NS_ID INTEGER,DESCRIPTION VARCHAR(255),"+
					"QTY INTEGER,RATE DECIMAL,"+
					"AMOUNT DECIMAL,"+
					"ITEM_STATUS VARCHAR(255),"+
					" TAX_CODE VARCHAR(255),"+
					"TAX_AMOUNT INTEGER,"+
					"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
					")";
	var f7 = {query:query7};
	dbs.query('po_lines',f7);
	dbs.update();
	console.log("PO Lines Created");
	
	var query8 = "CREATE TABLE packing_list"+
						"("+
						"PACKING_LIST_NS_ID INTEGER,"+
						"SHIP_TO VARCHAR(20),"+
						"SHIP_DATE DATE,"+
						"DELIVERY_METHOD VARCHAR(20),"+
						"SHIPMENT_ORIGIN VARCHAR(20),"+
						"SHIPMENT_POINT VARCHAR(20),"+
						"STATUS VARCHAR(20),"+
						"TIMESTAMP varchar(20),"+
						" packing_list_num varchar(20),"+
						" po_num varchar(20),"+
						" DATE_CREATED date,"+
						" MEMO varchar(20),"+
						" po_ns_id integer,"+
						" id SERIAL PRIMARY KEY,"+
						"vendor_ns_id varchar(20) references vendor_master(vendor_ns_id)"+
						")";
	var f8 = {query:query8};
	dbs.query('packing_list',f8);
	dbs.update();
	console.log("Packing List Created");
	
	
                var query9 = "INSERT INTO \"timestamp\" VALUES('PurchaseOrder','06/01/2016 10:15 PM','06/02/2016 10:45:16','1413')";
		var f9 = {query:query9};
		dbs.query(null,f9);
		dbs.update();
		
		
		
                var query10 = "INSERT INTO \"timestamp\" VALUES('Bills','06/05/2016 10:34 PM','06/06/2016 11:04:22','1413')";
		var f10 = {query:query10};
		dbs.query(null,f10);
		dbs.update();	
		
                var query11 ="INSERT INTO \"purchase_order\" VALUES(5179,'5/31/2016 7:40 am','2625','USA','',NULL,NULL,'4/29/2016',NULL,'',NULL,'CPT','','Pending Acknowledge',NULL,NULL,3000.00,NULL,'1413')";
		
                var f11={query:query11};
                dbs.query(null,f11);
                dbs.update();
		
	
		var query12 = "INSERT INTO \"purchase_order\" VALUES(5178,'5/31/2016 7:36 am','2624','USA','12-pack regular ball point pens, blue ink',NULL,NULL,'5/4/2016',NULL,'',NULL,'CIF','','Pending Acknowledge',NULL,NULL,2484.75,NULL,'1413')";
		
		var f12={query:query12};
                dbs.query(null,f12);
                dbs.update();
		
		
		var query13 ="INSERT INTO \"purchase_order\" VALUES(5166,'5/31/2016 6:32 am','2612','USA','Printer Ink Starter Pack',NULL,NULL,'5/5/2016',NULL,'',NULL,'FCA','','Fully Billed',NULL,NULL,650.00,NULL,'1413')";
		
		
		var f13={query:query13};
                dbs.query(null,f13);
                dbs.update();
		
		var query14 ="INSERT INTO \"purchase_order\" VALUES(5167,'5/31/2016 6:41 am','2613','USA','Apple iPad 2 GB RAM',NULL,NULL,'5/5/2016',NULL,'',NULL,'C&F','','Fully Billed',NULL,NULL,1600.00,NULL,'1413')";
		
		
		var f14={query:query14};
                dbs.query(null,f14);
                dbs.update();
			
		var query15 ="INSERT INTO \"purchase_order\" VALUES(5168,'5/31/2016 6:45 am','2614','USA','IFB AC 4 Tone',NULL,NULL,'5/5/2016',NULL,'',NULL,'C&F','','Fully Billed',NULL,NULL,3240.00,NULL,'1413')";
		
		var f15={query:query15};
                dbs.query(null,f15);
                dbs.update();
		
		var query16 ="INSERT INTO \"purchase_order\" VALUES(5169,'5/31/2016 7:02 am','2615','USA','',NULL,NULL,'5/11/2016',NULL,'',NULL,'CPT','','Fully Billed',NULL,NULL,1750.00,NULL,'1413')";
		
		var f16={query:query16};
                dbs.query(null,f16);
                dbs.update();
		
		var query17 ="INSERT INTO \"purchase_order\" VALUES(5170,'5/31/2016 7:07 am','2616','USA','',NULL,NULL,'5/16/2016',NULL,'',NULL,'CPT','','Acknowledged',NULL,NULL,500.00,NULL,'1413')";
		
		var f17={query:query17};
                dbs.query(null,f17);
                dbs.update();
		var query18 ="INSERT INTO \"purchase_order\" VALUES(5171,'5/31/2016 7:08 am','2617','USA','Printer Ink Starter Pack',NULL,NULL,'5/19/2016',NULL,'',NULL,'FCA','','Pending Acknowledge',NULL,NULL,150.00,NULL,'1413')";
		
		
		var f18={query:query18};
                dbs.query(null,f18);
                dbs.update();
			
		var query19 ="INSERT INTO \"purchase_order\" VALUES(5177,'5/31/2016 7:31 am','2623','USA','',NULL,NULL,'5/27/2016',NULL,'',NULL,'DDU','','Pending Acknowledge',NULL,NULL,4000.00,NULL,'1413')";
		
		
		var f19={query:query19};
                dbs.query(null,f19);
                dbs.update();
		
		var query20 ="INSERT INTO \"purchase_order\" VALUES(5172,'5/31/2016 7:10 am','2618','USA','',NULL,NULL,'5/21/2016',NULL,'',NULL,'CPT','','Pending Acknowledge',NULL,NULL,100.00,NULL,'1413')";
		
		var f20={query:query20};
                dbs.query(null,f20);
                dbs.update();
		
		var query21 ="INSERT INTO \"purchase_order\" VALUES(5173,'5/31/2016 7:14 am','2619','USA','',NULL,NULL,'5/19/2016',NULL,'',NULL,'C&F','','Pending Acknowledge',NULL,NULL,13500.00,NULL,'1413')";
		
		var f21={query:query21};
                dbs.query(null,f21);
                dbs.update();
		
		var query22 ="INSERT INTO \"purchase_order\" VALUES(5174,'5/31/2016 7:17 am','2620','USA','',NULL,NULL,'5/24/2016',NULL,'',NULL,'C&F','','Pending Acknowledge',NULL,NULL,24000.00,NULL,'1413')";
		
		var f22={query:query22};
                dbs.query(null,f22);
                dbs.update();
			
		var query23 = "INSERT INTO \"purchase_order\" VALUES(5176,'5/31/2016 7:27 am','2622','USA','',NULL,NULL,'5/30/2016',NULL,'',NULL,'CIF','','Pending Acknowledge',NULL,NULL,12500.00,NULL,'1413')";
		
		
		var f23={query:query23};
                dbs.query(null,f23);
                dbs.update();
		
		var query24 ="INSERT INTO \"purchase_order\" VALUES(5175,'5/31/2016 7:22 am','2621','USA','12-pack regular ball point pens, blue ink',NULL,NULL,'6/6/2016',NULL,'',NULL,'CIF','','Pending Acknowledge',NULL,NULL,2484.75,NULL,'1413')";
		
		var f24={query:query24};
                dbs.query(null,f24);
                dbs.update();
		
		var query25 = "INSERT INTO \"bill_list\" VALUES(5181,575,'6/1/2016 1:29 am','Bill Rest',NULL,'','1413')";
		
		var f25={query:query25};
                dbs.query(null,f25);
                dbs.update();
				
		var query26 = "INSERT INTO \"bill_list\" VALUES(5183,1600,'6/1/2016 1:41 am','',NULL,'','1413')";
				
		var f26={query:query26};
		dbs.query(null,f26);
		dbs.update();
		  
				
		var query27 = "INSERT INTO \"bill_list\" VALUES(5185,3240,'6/1/2016 1:57 am','',NULL,'','1413')";
				
	        var f27={query:query27};
	        dbs.query(null,f27);
	        dbs.update();
		
			
		var query28 = "INSERT INTO \"bill_list\" VALUES(5187,1750,'6/1/2016 2:20 am','',NULL,'','1413')";
				
		var f28={query:query28};
		dbs.query(null,f28);
		dbs.update();
		
					
		var query29 = "INSERT INTO \"bill_list\" VALUES(5189,200,'6/2/2016 11:06 pm','',NULL,'','1413')";
				
		var f29={query:query29};
	        dbs.query(null,f29);
	        dbs.update();
		
		var query30 = "INSERT INTO \"bill_list_lines\" VALUES(5181,'117','Printer Ink Starter Pack','Printer Ink Starter Pack',5,75,NULL,NULL,NULL,NULL,'1413')";
		
		var f30={query:query30};
                dbs.query(null,f30);
                dbs.update();
		
		var query31 = "INSERT INTO \"bill_list_lines\" VALUES(5181,'116','HP LJ 1320 Printer','HP LJ 1320 Printer',2,500,NULL,NULL,NULL,NULL,'1413')";
		
                var f31={query:query31};
                dbs.query(null,f31);
                dbs.update();
   
		
		var query32 = "INSERT INTO \"bill_list_lines\" VALUES(5183,'87','Apple iPad','Apple iPad',4,1600,NULL,NULL,NULL,NULL,'1413')";
		
                var f32={query:query32};
                dbs.query(null,f32);
                dbs.update();
			
		
		var query33 = "INSERT INTO \"bill_list_lines\" VALUES(5185,'92','Air Compressor','Air Compressor',3,3600,NULL,NULL,NULL,NULL,'1413')";
		
		var f33={query:query33};
                dbs.query(null,f33);
                dbs.update();
	
		
		
		var query34 = "INSERT INTO \"bill_list_lines\" VALUES(5185,'50','10% Discount','10% Discount',0,360,NULL,NULL,NULL,NULL,'1413')";
		
		var f34={query:query34};
                dbs.query(null,f34);
                dbs.update();
		
		var query35 = "INSERT INTO \"bill_list_lines\" VALUES(5187,'96','Packing Box 70X30','Packing Box 70X30',200,500,NULL,NULL,NULL,NULL,'1413')";
		
		var f35={query:query35};
                dbs.query(null,f35);
                dbs.update();
		
		var query36 = "INSERT INTO \"bill_list_lines\" VALUES(5187,'85','Brother All-in-One Printer/Copier/Scanner/Fax','Brother All-in-One Printer/Copier/Scanner/Fax',1,1250,NULL,NULL,NULL,NULL,'1413')";
		
		var f36={query:query36};
                dbs.query(null,f36);
                dbs.update();
			
		var query37 = "INSERT INTO \"bill_list_lines\" VALUES(5189,'93','Turbines','Turbines',2,200,NULL,NULL,NULL,NULL,'1413')";
		
		var f37={query:query37};
                dbs.query(null,f37);
                dbs.update();
		var query38 = "INSERT INTO \"vendor_master\" VALUES('1413','WebStore','Solutions','Devendra_Girase@cognizant.com','800-792-7329','456,MG Road  Wakad Pune ','Cog12345','(800) 792 7329','+9-8007927329')";
		var f38 = {query:query38};
		dbs.query(null,f38);
		dbs.update();	
		
		var query39 = "INSERT INTO \"po_lines\" VALUES('94','Pallets',5179,'Pallets',10,300,3000,NULL,NULL,NULL,'1413')";
		var f39 = {query:query39};
		dbs.query(null,f39);
		dbs.update();
			
		var query40 = "INSERT INTO \"po_lines\" VALUES('118','12-Pack Ball Point Pens',5178,'12-Pack Ball Point Pens',25,1.99,49.75,NULL,NULL,NULL,'1413')";
		
		var f40 = {query:query40};
		dbs.query(null,f40);
		dbs.update();
		
		var query41 = "INSERT INTO \"po_lines\" VALUES('96','Packing Box 70X30',5178,'Packing Box 70X30',200,2.5,500,NULL,NULL,NULL,'1413')";
		
		var f41 = {query:query41};
		dbs.query(null,f41);
		dbs.update();
		
		var query42 = "INSERT INTO \"po_lines\" VALUES('98','Spiral Stairs',5178,'Spiral Stairs',1,2000,2000,NULL,NULL,NULL,'1413')";
		
		var f42 = {query:query42};
		dbs.query(null,f42);
		dbs.update();
		
		var query43 = "INSERT INTO \"po_lines\" VALUES('50','10% Discount',5178,'10% Discount',NULL,-10,200,NULL,NULL,NULL,'143')";
		
		var f43 = {query:query43};
		dbs.query(null,f43);
		dbs.update();
		
		var query44 = "INSERT INTO \"po_lines\" VALUES('117','Printer Ink Starter Pack',5178,'Printer Ink Starter Pack',10,15,150,NULL,NULL,NULL,'1413')";
		
		var f44 = {query:query44};
		dbs.query(null,f44);
		dbs.update();
		
		var query45 = "INSERT INTO \"po_lines\" VALUES('50','10% Discount',5178,'10% Discount',NULL,-10,15,NULL,NULL,NULL,'1413')";
		
		var f45 = {query:query45};
		dbs.query(null,f45);
		dbs.update();
			
		var query46 = "INSERT INTO \"po_lines\" VALUES('117','Printer Ink Starter Pack',5166,'Printer Ink Starter Pack',10,15,150,NULL,NULL,NULL,'1413')";
		
		var f46 = {query:query46};
		dbs.query(null,f46);
		dbs.update();
			
		var query47 = "INSERT INTO \"po_lines\" VALUES('116','HP LJ 1320 Printer',5166,'HP LJ 1320 Printer',2,250,500,NULL,NULL,NULL,'1413')";
		
		var f47 = {query:query47};
		dbs.query(null,f47);
		dbs.update();
		var query48 = "INSERT INTO \"po_lines\" VALUES('87','Apple iPad',5167,'Apple iPad',4,400,1600,NULL,NULL,NULL,'1413')";
		
		var f48 = {query:query48};
		dbs.query(null,f48);
		dbs.update();
			
		var query49 = "INSERT INTO \"po_lines\" VALUES('92','Air Compressor',5168,'Air Compressor',3,1200,3600,NULL,NULL,NULL,'1413')";
		
		var f49 = {query:query49};
		dbs.query(null,f49);
		dbs.update();
			
			
		var query50 = "INSERT INTO \"po_lines\" VALUES('50','10% Discount',5168,'10% Discount',NULL,-10,360,NULL,NULL,NULL,'1413')";
		
		var f50 = {query:query50};
		dbs.query(null,f50);
		dbs.update();
			
		var query51 = "INSERT INTO \"po_lines\" VALUES('96','Packing Box 70X30',5169,'Packing Box 70X30',200,2.5,500,NULL,NULL,NULL,'1413')";
		
		var f51 = {query:query51};
		dbs.query(null,f51);
		dbs.update();
		var query52 = "INSERT INTO \"po_lines\" VALUES('85','Brother All-in-One Printer/Copier/Scanner/Fax',5169,'Brother All-in-One Printer/Copier/Scanner/Fax',1,1250,1250,NULL,NULL,NULL,'1413')";
		
		var f52 = {query:query52};
		dbs.query(null,f52);
		dbs.update();
			
		var query53 = "INSERT INTO \"po_lines\" VALUES('117','Printer Ink Starter Pack',5171,'Printer Ink Starter Pack',10,15,150,NULL,NULL,NULL,'1413')";
		
		var f53 = {query:query53};
		dbs.query(null,f53);
		dbs.update();
		
		var query54 = "INSERT INTO \"po_lines\" VALUES('90','Meal Pack',5172,'Meal Pack',20,5,100,NULL,NULL,NULL,'1413')";
		
		var f54 = {query:query54};
		dbs.query(null,f54);
		dbs.update();
		
		var query55 = "INSERT INTO \"po_lines\" VALUES('94','Pallets',5173,'Pallets',45,300,13500,NULL,NULL,NULL,'1413')";
		
		var f55 = {query:query55};
		dbs.query(null,f55);
		dbs.update();
		var query56 = "INSERT INTO \"po_lines\" VALUES('-3','Description',5173,'Description',NULL,NULL,0,NULL,NULL,NULL,'1413')";
		
		var f56 = {query:query56};
		dbs.query(null,f56);
		dbs.update();
		
		var query57 = "INSERT INTO \"po_lines\" VALUES('93','Turbines',5174,'Turbines',3,8000,24000,NULL,NULL,NULL,'1413')";
		
		var f57 = {query:query57};
		dbs.query(null,f57);
		dbs.update();
		
		var query58 = "INSERT INTO \"po_lines\" VALUES('95','Globes',5177,'Globes',5,800,4000,NULL,NULL,NULL,'1413')";
		
		var f58 = {query:query58};
		dbs.query(null,f58);
		dbs.update();
		
		var query59 = "INSERT INTO \"po_lines\" VALUES('97','Premier Polyfilm',5176,'Premier Polyfilm',5,2500,12500,NULL,NULL,NULL,'1413')";
		
		var f59 = {query:query59};
		dbs.query(null,f59);
		dbs.update();
		
		var query60 = "INSERT INTO \"po_lines\" VALUES('118','12-Pack Ball Point Pens',5175,'12-Pack Ball Point Pens',25,1.99,49.75,NULL,NULL,NULL,'1413')";
		
		var f60 = {query:query60};
		dbs.query(null,f60);
		dbs.update();
		
		var query61 = "INSERT INTO \"po_lines\" VALUES('96','Packing Box 70X30',5175,'Packing Box 70X30',200,2.5,500,NULL,NULL,NULL,'1413')";
		
		var f61 = {query:query61};
		dbs.query(null,f61);
		dbs.update();	
		
		var query62 = "INSERT INTO \"po_lines\" VALUES('98','Spiral Stairs',5175,'Spiral Stairs',1,2000,2000,NULL,NULL,NULL,'1413')";
		
		var f62 = {query:query62};
		dbs.query(null,f62);
		dbs.update();
		
		var query63 = "INSERT INTO \"po_lines\" VALUES('50','10% Discount',5175,'10% Discount',NULL,-10,200,NULL,NULL,NULL,'1413')";
		
		var f63 = {query:query63};
		dbs.query(null,f63);
		dbs.update();
			
		
		var query64 = "INSERT INTO \"po_lines\" VALUES('117','Printer Ink Starter Pack',5175,'Printer Ink Starter Pack',10,15,150,NULL,NULL,NULL,'1413')";
		
		var f64 = {query:query64};
		dbs.query(null,f64);
		dbs.update();
		
		var query65 = "INSERT INTO \"po_lines\" VALUES('50','10% Discount',5175,'10% Discount',NULL,-10,15,NULL,NULL,NULL,'1413')";
		
		var f65 = {query:query65};
		dbs.query(null,f65);
		dbs.update();	
		
		
		var query66 = "INSERT INTO \"vendor_master\" VALUES('1416','WebStore','Solutions','shaurya.aggarwal@cognizant.com','987-654-3210','GVC Bangalore ','Cog12345','(800) 792 7329','+9-8007927329')";
		var f66 = {query:query66};
		dbs.query(null,f66);
		dbs.update();
		*/
	res.render('login',{});
});

app.post('/login', function(req,res,next){
	
	
	module.exports.rec_type = 'ProfileView';	
	
	console.log('in login post ejs');
	
	var not_data =new Array();
	var email_val=req.body.your_email;
	var password_val=req.body.your_password;
	
	console.log('email_val:'+email_val);
	console.log('password_val:'+password_val);
	
	
	
	function onFailure(err) {
  process.stderr.write("Refresh Failed: " + err.message + "\n");
  process.exit(1);
	}

//var rest_params = {event:"edit",rec_id:req.body.ns_id,address:req.body.address,fax:req.body.fax,phone:req.body.phone,alt_phone:req.body.altphone,email:req.body.email};

var rest_params = {event:"login",email:req.body.your_email,password:req.body.your_password};


// This will try the cached version first, if not there will run and then cache 

var vendorid=null;
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
  console.log(JSON.stringify(results));
  //console.log('Results login st::'+results.status);
  console.log('Results login::'+results);
  console.log('Results login msg::'+results.message);
	//console.log('Results login msg::');	
  console.log('Results login st::'+results.status);
 	
  
 //var contents='';		
 
			if(results.status=='Successful')
			{
				console.log("response vendor id::"+results.vendor_id);
				vendorid=results.vendor_id;
				gl_ack = results.ack;
				gl_pl = results.plist;
				var fields_vendor_login= {key:"vendor_ns_id::integer",operator:"=",value:vendorid};
				dbs.query('vendor_master',fields_vendor_login);
				dbs.readData(function (result){
				console.log("result vendor_master count :: "+ result.length);
				if(result.length!=0)
				{
					if(vendorid)
			  		{
						req.session.user = result;
						
						module.exports.rec_type = 'Updateall';
						var billpayment_ts_val = null;
						var itemreceipt_ts_val = null;
						var bill_ts_val = null;
						var purchaseorder_ts_val = null;
						var fields_timestamp_data = {key:"vendor_ns_id::integer",operator:"=",value:vendorid};
						dbs.query('timestamp',fields_timestamp_data);
						dbs.readData(function (result1){
							if(result1.length!=0)
							{
								for(i=0;i<result1.length;i++)
								{
									if(result1[i].rec_type=='BillPayment')
									{
										billpayment_ts_val = result1[i].timestamp;
									}
									else if(result1[i].rec_type=='ItemReceipt')
									{
										itemreceipt_ts_val = result1[i].timestamp;
									}
									else if(result1[i].rec_type=='Bills')
									{
										bill_ts_val = result1[i].timestamp;
									}
									else
									{
										purchaseorder_ts_val = result1[i].timestamp;
									}
								}
							}
							     });
						var count = 0 ;
						setTimeout(function () {
						var rest_params_update = {event:"refresh",vendor_id:vendorid,itemreceipt_ts:itemreceipt_ts_val,bill_ts:bill_ts_val,billpayment_ts:billpayment_ts_val,purchaseorder_ts:purchaseorder_ts_val};
						search.run(rest_params_update, function (err, results) {
						  if (err) onFailure(err);
						  console.log("Combined Refresh Results --> "+JSON.stringify(results));
						console.log("Combined Refresh Results");
							
							console.log("Updated PO Count --> " + results[0].status);
							if(results[0].status=="success")
							{
								count++;
								var data3 = results[0].value + " Purchase Order updated/created";
								console.log("Total PO Count --> " + results[1].podetails.length);
								not_data.push(data3);
							}
							
							console.log("Updated IR Count --> " + results[2].status);
							if(results[2].status=="Successful")
							{
								count++;
								var data = results[2].itemreceiptdetails.length + " Item Receipt updated/created";
								not_data.push(data);
							}
							console.log("Updated Bills Count --> " + results[3].status);
							if(results[3].status=="Successful")
							{
								count++;
								var data1 = results[3].billdetails.length + " Bills updated/created";
								not_data.push(data1);
							}
							console.log("Updated Bill Payment Count --> " + results[4].status);
							if(results[4].status=="Successful")
							{
								count++;
								var data2 = results[4].billpaymentdetails.length + " Bill Payments updated/created";
								not_data.push(data2);
							}
							setTimeout(function () {
							res.redirect(303,'dashboard?vendorid='+vendorid+'&notdata[]='+not_data+'&count='+count);
								},2000);
						});
						 },1000);
			  		}
					else
			  		{
				  		res.redirect(303,'login');
			  		}
				}
				});
			}
				else
				{
					res.redirect(303,'login');
				}
			
});

  //console.log("vendor id::"+vendorid);

	

	
});

app.get('/changepassword', requireLogin, function(req,res,next){
	console.log('in changepaswd get ejs');
	
	var vendorid_val;
	vendorid_val=req.query.vendorid;
		console.log('vendorid_val::'+vendorid_val);

		if(vendorid_val)
		{
		//console.log('vendorid_val present::'+vendorid_val);	
		res.render('changepassword',{v_id:req.query.vendorid});
		}
		else
		{
			//console.log('vendorid_val not present::'+vendorid_val);	
			res.render('changepassword',{v_id:null});
		}
	
	
});

app.post('/changepassword', function(req,res,next){
	
	
	module.exports.rec_type = 'ProfileView';	
	
	console.log('in changepaswd post ejs');
	
	var email_val=req.body.your_email;
	var new_password_val=req.body.new_password;
	var confirm_password_val=req.body.confirm_password;
	var old_password_val = req.body.old_password;
	
	console.log('email_val:'+email_val);
	console.log('new_password_val:'+new_password_val);
	console.log('confirm_password_val:'+confirm_password_val);
	console.log('old_password_val :: '+ old_password_val);
	email_val_com = "'" + email_val + "'";
	
	var fields_vendormaster_details= {key:"email_id",operator:"=",value:email_val_com};
	dbs.query('vendor_master',fields_vendormaster_details);
	dbs.readData(function (result){
		console.log("result vendor details for password change :: "+ result);	
		if(result!=null)
		{
			function onFailure(err) {
  				process.stderr.write("Refresh Failed: " + err.message + "\n");
  				process.exit(1);	
				}
		
	
	//var contents = db.exec("select * from vendor_master where email_id='"+email_val+"'");
		
//var rest_params = {event:"edit",rec_id:req.body.ns_id,address:req.body.address,fax:req.body.fax,phone:req.body.phone,alt_phone:req.body.altphone,email:req.body.email};

		var rest_params = {event:"changepassword",email:email_val,oldpassword:old_password_val,newpassword:confirm_password_val};


// This will try the cached version first, if not there will run and then cache 

var vendorid=null;
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
  console.log(JSON.stringify(results));
  
   console.log('Results login::'+results);
	console.log('Results login msg::'+results.message);
	console.log('Results login st::'+results.status);
  
	if(results.status=='Successful')
	{
	
				//alert("Password updated successfully! Please Login with new password.");
				//window.location.href("login.html");
				res.redirect(303,'login');
				
	}			
	else
	{
				//alert("Password update failed, Please try again!");
				//window.location.href("changepassword.html");
				res.redirect(303,'changepassword');
	}
		

});
}

else
{
	res.redirect(303,'changepassword');
}
		
	});
  
});

/* GET profile view page. */
app.get('/profileview', requireLogin, function(req, res, next) { // route for '/'

	if(id)
	{
	console.log("Profile view page ");
	
	console.log("vendor_id  "+req.query.vendorid);
	
	id=req.query.vendorid;  

	module.exports.rec_type = 'NewVendor';
	
	var rest_params = {event:"refresh",vendor_id:id};
	
	function onFailure(err) 
	{
  		process.stderr.write("Refresh Failed: " + err.message + "\n");
  		process.exit(1);	
	}
	
	search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
  console.log(JSON.stringify(results));
  
   console.log('Results login::'+results);
	console.log('Results login msg::'+results.message);
	console.log('Results login st::'+results.status);
  
	if(results.status=='Successful')
	{
	
		if(results.Delivery_leadtime==''||results.Delivery_leadtime==null)
		{
			var dlt = 0;
		}
		else
		{
			var dlt = results.Delivery_leadtime;
		}
		if(results.Ex_Factoryleadtime==''||results.Ex_Factoryleadtime==null)
		{
			var elt = 0;
		}
		else
		{
			var elt = results.Ex_Factoryleadtime;
		}
		var sq = (results.Security_ques).replace(/\'/g,"''");
		var update_query = "update vendor_master set email_id='" + results.Email
					+ "', phone='" + results.Phone
					+ "',address='" + results.Address
					+ "',alt_phone='" + results.Alt_phn
					+ "',fax ='" + results.Fax
					+ "',currency='" + results.Currency
					+ "',shipment_origin='" + results.Shipping_origin
					+ "',shipping_point='" + results.Shipping_point
					+ "',delivery_lead_time='" + dlt
					+ "',exfactory_lead_time='" + elt
					+ "',terms='" + results.Terms
					+ "',incoterm='" + results.Incoterms
					+ "',security_question='" + sq
					+ "',security_answer='" + results.Security_ans
					+ "',delivery_method='" + results.Delivery_method
					+ "',contact_name='" + results.contactname
					+ "',contact_phone='" + results.contactno
					+ "',date_created='" + results.datecreated
					+ "' where vendor_ns_id::integer=" + results.vendor_id;
					
		console.log("Update query before display :: " + update_query);
		var fields_update_vendor_profile_details= {query:update_query};
		dbs.query('vendor_master',fields_update_vendor_profile_details);
		dbs.update();
	}			
});



	var fields_vendor_profile_details= {key:"vendor_ns_id::integer",operator:"=",value:id};
	dbs.query('vendor_master',fields_vendor_profile_details);
	dbs.readData(function (result){
	console.log("result vendor_profile_details :: "+ JSON.stringify(result));	
	
	console.log("contents length : "+result.length);
	for (var i=0; i<result.length; i++) 
	{
		 name_val = result[i].first_name; 
		 lastname_val = result[i].last_name;
		 email_val = result[i].email_id;
		 if(result[i].phone=='null')
		 {
		 	phone_val = '';
		 }
		 else
		 {
		 	phone_val = result[i].phone;
		 }
		 if(result[i].address=='null')
		 {
		 	address_val = '';
		 }
		 else
		 {
		 	address_val = result[i].address;
		 }
		 if(result[i].alt_phone=='null')
		 {
		 	altphone_val = '';
		 }
		 else
		 {
			altphone_val = result[i].alt_phone;
		 }
		shipment_origin_val = result[i].shipment_origin;
		if(result[i].shipping_point=='null'||result[i].shipping_point=='')
		{
			shipment_point_val = '';	
		}
		else
		{
			shipment_point_val = result[i].shipping_point;
		}
		delivery_method_val = result[i].delivery_method;
		delivery_lead_time_val = result[i].delivery_lead_time;
		exfactory_lead_time_val = result[i].exfactory_lead_time;
		terms_val = result[i].terms;
		incoterms_val = result[i].incoterm;
		currency_val = result[i].currency;
		security_question_val = result[i].security_question;
		if(result[i].security_answer=='null'||result[i].security_answer=='')
		{
			security_answer_val = '';
		}
		else
		{
			security_answer_val = result[i].security_answer;
		}
		console.log("Fax::  -->>" +  result[i].fax);
		if(result[i].fax==''||result[i].fax=='null')
		{
			fax_val = '' ;
			console.log("Fax when null or empty " + fax_val );
		}
		else
		{
			fax_val = result[i].fax;
		}
		company_name = result[i].company_name; 
		vendor_name= name_val+' '+lastname_val;
		is_person_val = result[i].isperson;
		if(result[i].contact_name=='null')
		{
			contact_name_val = '';
		}
		else
		{
			contact_name_val = result[i].contact_name;
		}
		if(result[i].contact_phone=='null')
		{
			contact_phone_val='';
		}
		else
		{
			contact_phone_val = result[i].contact_phone;
		}
		console.log("name_val "+name_val);
	}
	
  res.render('profileview', { //render the index.ejs
	 
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  	  
	  name:vendor_name,
	  email:email_val,
	  address:address_val,
	  phone:phone_val,
	  fax:fax_val,
	  altphone:altphone_val,
	  shipment_origin:shipment_origin_val,
	  shipment_point:shipment_point_val,
	  delivery_method:delivery_method_val,
	  delivery_lead_time:delivery_lead_time_val,
	  exfactory_lead_time:exfactory_lead_time_val,
	  terms:terms_val,
	  incoterms:incoterms_val,
	  currency:currency_val,
	  security_questions:security_question_val,
	  security_answer:security_answer_val,
	  contact_name:contact_name_val,
	  contact_phone:contact_phone_val,
	  isperson:is_person_val
	  
  });
		
	});
  }
else
{
	res.render('signout',{});
}
});

/*GET profile edit page. */
app.get('/profileedit', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("In Get of  Profile edit page ");

	console.log("vendor_id  "+req.query.vendorid);

	id=req.query.vendorid;  

        var fields_vendor_profile_details= {key:"vendor_ns_id::integer",operator:"=",value:id};
	dbs.query('vendor_master',fields_vendor_profile_details);
	dbs.readData(function (result){
	console.log("result vendor_profile_details :: "+ JSON.stringify(result));

//var contents = db.exec("select * from vendor_master where vendor_ns_id="+id);
	console.log("contents length : "+result.length);
	for (var i=0; i<result.length; i++) 
	{
		vendor_id = result[i].vendor_ns_id; 
		 name_val = result[i].first_name; 
		 lastname_val = result[i].last_name;
		 email_val = result[i].email_id;
		 if(result[i].phone=='null')
		 {
		 	phone_val = '' ;	
		 }
		 else
		 {
		 	phone_val = result[i].phone;
		 }
		 if(result[i].address=='null')
		 {
		 	address_val = '' ;	
		 }
		 else
		 {
		 	address_val = result[i].address;
		 }
		 if(result[i].alt_phone=='null')
		 {
		 	altphone_val='';
		 }
		 else
		 {
			altphone_val = result[i].alt_phone;
		 }
		if(result[i].fax=='null')
		{
			fax_val = '' ;
		}
		else
		{
			fax_val = result[i].fax;
		}
		company_name_val = result[i].company_name;
		currency_val = result[i].currency;
		shipment_origin_val = result[i].shipment_origin;
		if(result[i].shipping_point=='null')
		{
			shipping_point_val = '' ;
		}
		else
		{
			shipping_point_val = result[i].shipping_point;
		}
		delivery_lead_time_val = result[i].delivery_lead_time;
		exfactory_lead_time_val = result[i].exfactory_lead_time;
		terms_val = result[i].terms;
		incoterm_val = result[i].incoterm;
		security_question_val = result[i].security_question;
		contact_name_val = result[i].contact_name;
		contact_phone_val = result[i].contact_phone;
		
		console.log("Security Question in Profile Edit Get -->" + result[i].security_question);
		
		//security_question_val = security_question_val.replace(/\'/g,"''");
		if(result[i].security_answer=='null')
		{
			security_answer_val = '';
		}
		else
		{
			security_answer_val = result[i].security_answer;
		}
		delivery_method_val = result[i].delivery_method;
		if(result[i].contact_name=='null')
		{
			contact_name_val = '' ;
		}
		else
		{
			contact_name_val = result[i].contact_name;
		}
		isperson_val = result[i].isperson;
		if(result[i].contact_phone ==  'null')
		{
			contact_phone_val = '' ;
		}
		else
		{
			contact_phone_val = result[i].contact_phone;
		}
		 vendor_name= name_val+' '+lastname_val; 
		console.log("address_val "+address_val);
	}
	
  res.render('profileedit', { //render the index.ejs
	 
	  name:vendor_name,
	  email:email_val,
	  address:address_val,
	  phone:phone_val,
	  fax:fax_val,
	  altphone:altphone_val,
	  company_name:company_name_val,
	  currency:currency_val,
	  shipment_origin:shipment_origin_val,
	  shipping_point:shipping_point_val,
	  delivery_lead_time:delivery_lead_time_val,
	  exfactory_lead_time:exfactory_lead_time_val,
	  terms:terms_val,
	  incoterm:incoterm_val,
	  security_question:security_question_val,
	  security_answer:security_answer_val,
	  delivery_method:delivery_method_val,
	  contact_name:contact_name_val,
	  contact_phone:contact_phone_val,
	  isperson:isperson_val,
	  ns_id:vendor_id,
	  
	  notdata_rend:notdata,
	  count_rend:count,
	  v_id:vendor_id
	  
  });
	});
}
else
{
	res.render('signout',{});
}


});

/*POST profile edit page. */
app.post('/profileedit',function(req,res){
	
if(id)
{
	
	console.log("In Post of Profile Edit Page") ;
	
	module.exports.rec_type = 'ProfileView';	

	function onFailure(err) {
	  process.stderr.write("Refresh Failed: " + err.message + "\n");
	  process.exit(1);
	}
	function parseJson(res)
	{
		var jsonC = JSON.parse(res);
		var val = jsonC["id"];
		return val ;
	}

	//var address_val = req.body.address;
	//console.log("Address --> " + address_val );
	
	var altphone_val = req.body.altphone;
	console.log("Altphone --> " + altphone_val );
	
	var phone_val = req.body.phone;
	console.log("Phone --> " + phone_val);
	
	var fax_val= req.body.fax;
	console.log("Fax --> " + fax_val);
	
	var address_val= req.body.address;
	console.log("Address --> " + address_val);

	var currency_val= req.body.currency;
	console.log("Currency --> " + currency_val);	
	
	var terms_val= req.body.terms;
	console.log("Terms --> " + terms_val);
	
	var incoterm_val= req.body.incoterms;
	console.log("Incoterms --> " + incoterm_val);	
	
	var exfactory_lead_time_val= req.body.exfactory_lead_time;
	console.log(" Exfactory Lead Time--> " + exfactory_lead_time_val);	
	
	var delivery_lead_time_val= req.body.delivery_lead_time;
	console.log("Delivery Lead Time --> " + delivery_lead_time_val);	
	
	var shipment_origin_val= req.body.shipment_origin;
	console.log("Shipment Origin --> " + shipment_origin_val);
	
	var shipment_point_val= req.body.shipment_point;
	console.log("Shipment Point --> " + shipment_point_val);	
	
	var security_question_val = req.body.security_question;
	console.log("Security Question --> " + security_question_val );
	
	var security_answer_val = req.body.security_answer;
	console.log("Security Answer --> " + security_answer_val);
	
	var delivery_method_val = req.body.delivery_method;
	console.log("Delivery Method --> " + delivery_method_val);
	
	var contact_person_name_val = req.body.contact_name ; 
	console.log("Contact Person Name --> " + contact_person_name_val);
	
	var contact_phone_val = req.body.contact_number ; 
	console.log("Contact Phone --> " + contact_phone_val);
	
	//var rest_params = {event:"edit",rec_id:req.body.ns_id,address:req.body.address,fax:req.body.fax,phone:req.body.phone,alt_phone:req.body.altphone,email:req.body.email};
	var rest_params = {"event":"edit","rec_id":id,"altphone":altphone_val,"phone":phone_val,"fax":fax_val,"address":address_val,"currency":currency_val,"terms":terms_val,"incoterm":incoterm_val,"exfactory_lead_time":exfactory_lead_time_val,"delivery_lead_time":delivery_lead_time_val,"shipment_origin":shipment_origin_val,"shipment_point":shipment_point_val,"security_question":security_question_val,"security_answer":security_answer_val,"delivery_method":delivery_method_val,"contact_person_name":contact_person_name_val,"contact_phone":contact_phone_val};

// This will try the cached version first, if not there will run and then cache 
	search.run(rest_params, function (err, results) {
	  if (err) onFailure(err);
	  console.log(JSON.stringify(results));
	  
	   console.log('Results login::'+results);
		console.log('Results login msg::'+results.message);
		console.log('Results login st::'+results.status);
		
		//res.redirect(303,'/profileview?vendorid='+req.body.ns_id);
		
		 if(results.status=='Successful')
		{
	
			if(results.Delivery_leadtime==''||results.Delivery_leadtime==null)
			{
				var dlt = 0;
			}
			else
			{
				var dlt = results.Delivery_leadtime;
			}
			if(results.Ex_Factoryleadtime==''||results.Ex_Factoryleadtime==null)
			{
				var elt = 0;
			}
			else
			{
				var elt = results.Ex_Factoryleadtime;
			}
			var sq = (results.Security_ques).replace(/\'/g,"''");
			var update_query = "update vendor_master set phone='" + results.Phone
						+ "',address='" + results.Address
						+ "',alt_phone='" + results.Alt_phn
						+ "',fax ='" + results.Fax
						+ "',currency='" + results.Currency
						+ "',shipment_origin='" + results.Shipping_origin
						+ "',shipping_point='" + results.Shipping_point
						+ "',delivery_lead_time='" + dlt
						+ "',exfactory_lead_time='" + elt
						+ "',terms='" + results.Terms
						+ "',incoterm='" + results.Incoterms
						+ "',security_question='" + sq
						+ "',security_answer='" + results.Security_ans
						+ "',delivery_method='" + results.Delivery_method
						+ "',contact_name='" + results.contactname
						+ "',contact_phone='" + results.contactno
						+ "',date_created='" + results.datecreated
						+ "' where vendor_ns_id::integer=" + id;
			console.log("Update query in Profile Post " + update_query);			
			var fields_update_vendor_profile_details= {query:update_query};
			dbs.query('vendor_master',fields_update_vendor_profile_details);
			dbs.update();
			res.redirect(303,'/profileview?vendorid='+ id+'&notdata[]='+notdata+'&count='+count);
		}
		else
		{
			res.redirect(303,'/dashboard?notdata[]='+notdata+'&count='+count);
		} 
	  
	});

//console.log('results:'+results);
	
}
else
{
	res.render('signout',{});
}
	
});

/*GET Vendor Create Page. */
app.get('/signup', function(req, res, next) { // route for '/'

	console.log("in signup get ejs");
	res.render('signup',{});
});

/*POST Vendor Create Page. */
app.post('/signup',function(req,res){
	
	console.log('post of signup');
	var rec_type = 'NewVendor';
	module.exports.rec_type = rec_type;
	
	function onFailure(err) {
	  process.stderr.write("Refresh Failed: " + err.message + "\n");
	  process.exit(1);
	}

	var date_obj=new Date();
		Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
					
		var date_obj = new Date,
		    current_date = [(date_obj.getMonth()+1).padLeft(),
		               date_obj.getDate().padLeft(),
		               date_obj.getFullYear()].join('/') +' ' +
		              [date_obj.getHours().padLeft(),
		               date_obj.getMinutes().padLeft(),
		               date_obj.getSeconds().padLeft()].join(':');
	

	console.log("rec_type  "+rec_type);
	
	var shipment_origin_val = null;
	var shipment_point_val = null;
	var delivery_method_val = null;
	var currency_val = null;
	var company_name_val = null;
	var delivery_lead_time_val = null;
	var exfactory_lead_time_val = null;
	var terms_val = null;
	var incoterm_val = null;
	var security_question_val = null;
	var security_answer_val = null;
	var email_val = null;
	var phone_val = null;
	var address_val = null;
	var password_val =  null;
	var altphone_val = null;
	var fax_val = null;
	var contact_name_val = null;
	var contact_phone_val = null;
	var firstname_val = null;
	var lastname_val = null;
	var isperson_val = null;
	
		shipment_origin_val = req.body.shipment_origin;
		shipment_point_val = req.body.shipping_point;
		delivery_method_val = req.body.modes;
		delivery_lead_time_val = req.body.delivery_lead_time;
		
		terms_val = req.body.terms;
		incoterm_val = req.body.incoterms;
		security_question_val = req.body.security;
		security_answer_val = req.body.security_answer;
		phone_val = req.body.contact_number;
		altphone_val = req.body.alternate_contact_number;
		fax_val = req.body.faxno;
		exfactory_lead_time_val = req.body.exfactory_lead_time;
		email_val = req.body.your_email;
		currency_val = req.body.currency;
		password_val = req.body.password;
		company_name_val = req.body.company_name;
		
		if(req.body.address_line1||req.body.address_line2||req.body.city||req.body.region||req.body.postal_code||req.body.country)
		{
		//	console.log("Address --> " + req.query.address_line1 + "\n" + req.query.address_line2 +"\n" + req.query.city + "\n" + req.query.region + "\n" + req.query.country + "\n" + req.query.postal_code );
			address_val = req.body.address_line1 + "\n" + req.body.address_line2 +"\n" + req.body.city + "\n" + req.body.region + "\n" + req.body.country + "\n" + req.body.postal_code;
		}
		
		
		if(req.body.shipment_origin)
		{
			console.log("Shipment Origin  -->" + req.body.shipment_origin);
			console.log("Shipment Origin Value -->" + shipment_origin_val);
			
		}
		if(req.body.shipping_point)
		{
			console.log("Shipment Point  -->" + req.body.shipping_point);
			console.log("Shipment Point Val -->" + shipment_point_val);
			
		}
		if(req.body.modes)
		{
			console.log("Delivery Method--> "+ req.body.modes);
			console.log("Delivery Method Val --> "+ delivery_method_val);
		}
			console.log("Currency -->" + req.body.currency);
			console.log("Currency Val -->" + currency_val);
			console.log("Company Name -->" + req.body.company_name );
			console.log("Company Name Val -->" + company_name_val );
		
		if(req.body.delivery_lead_time)
		{
			console.log("Delivery Lead Time -->" + req.body.delivery_lead_time);
			console.log("Delivery Lead Time Val -->" + delivery_lead_time_val);
		}
		if(req.body.exfactory_lead_time)
		{
			console.log("Ex-factory Lead Time -->" + req.body.exfactory_lead_time);
			console.log("Ex-factory Lead Time Val -->" + exfactory_lead_time_val);
		}
		if(req.body.terms)
		{
			console.log("Terms -->" + req.body.terms);
			console.log("Terms Val -->" + terms_val);
		}
		if(req.body.incoterms)
		{
			console.log("In CoTerms -->" + req.body.incoterms);
			console.log("In CoTerms Val -->" + incoterm_val);
		}
		if(req.body.security)
		{
			console.log("Security Question -->" + req.body.security);
			console.log("Security Question Val -->" + security_question_val);
		}
		if(req.body.security_answer)
		{
			console.log("Security Answer -->" + req.body.security_answer);
			console.log("Security Answer Val -->" + security_answer_val);
		}
		console.log("Email ID -->" + req.body.your_email);
		console.log("Email ID Val-->" + email_val);
		if(req.body.contact_number)
		{
			console.log("Phone -->" + req.body.contact_number);
			console.log("Phone Val -->" + phone_val);
		}
			if(req.body.address_line1||req.body.address_line2||req.body.city||req.body.region||req.body.postal_code||req.body.country)
		{
			console.log("Address --> " + req.body.address_line1 + req.body.address_line2 + req.body.city + req.body.region + req.body.country + req.body.postal_code );
			console.log("Address Val --> " + address_val );
		}
		console.log("Password -->" + req.body.password);
		console.log("Password Val -->" + password_val);
		if(req.body.alternate_contact_number)
		{
			console.log("Alt-Phone -->" + req.body.alternate_contact_number);
			console.log("Alt-Phone Val -->" + altphone_val);
		}
		if(req.body.faxno)
		{
			console.log("Fax -->" + req.body.faxno);
			console.log("Fax Val-->" + fax_val);
		}
		
		
		
		setTimeout(function () {
		if(req.body.first_name||req.body.last_name)
		{
			
			isperson_val = 'Individual';
			firstname_val = req.body.first_name;
			lastname_val = req.body.last_name;
			if(req.body.first_name)
			{
				console.log("First Name -->" + req.body.first_name);
				firstname_val = req.body.first_name;
			}
			
			if(req.body.last_name)
			{
				console.log("Last Name -->" + req.body.last_name);
				lastname_val = req.body.last_name;
			}
			var rest_params = {"event":"create","shipment_origin":shipment_origin_val,"shipment_point":shipment_point_val,"delivery_method":delivery_method_val,"currency":currency_val,"companyname":company_name_val,"delivery_lead_time":delivery_lead_time_val,"exfactory_lead_time":exfactory_lead_time_val,"terms":terms_val,"incoterm":incoterm_val,"security_question":security_question_val,"security_answer":security_answer_val,"email":email_val,"phone":phone_val,"address":address_val,"password":password_val,"altphone":altphone_val,"fax":fax_val,"firstname":firstname_val,"lastname":lastname_val,"isperson":isperson_val};
			console.log("Rest Params :: " + JSON.stringify(rest_params));
			
		}
		else
		{
			isperson_val = 'Company';
			contact_name_val = req.body.contact_person;
			contact_phone_val = req.body.phone_number;
			if(req.body.contact_person)
			{
				console.log("Contact Name -->" + req.body.contact_person);
				//contact_name_val = req.body.contact_person;
			}
			if(req.body.phone_number)
			{
				console.log("Contact Phone -->" + req.body.phone_number);
				//contact_phone_val = req.body.con_number;
			}
			var rest_params = {event:"create",shipment_origin:shipment_origin_val,shipment_point:shipment_point_val,delivery_method:delivery_method_val,currency:currency_val,companyname:company_name_val,delivery_lead_time:delivery_lead_time_val,exfactory_lead_time:exfactory_lead_time_val,terms:terms_val,incoterm:incoterm_val,security_question:security_question_val,security_answer:security_answer_val,email:email_val,phone:phone_val,address:address_val,password:password_val,altphone:altphone_val,fax:fax_val,contact_person_name:contact_name_val,contact_phone:contact_phone_val,isperson:isperson_val};	
			console.log("Rest Params :: " + JSON.stringify(rest_params));
			
		}
		
		search.run(rest_params, function (err, results) {
		  if (err) onFailure(err);
		 
		 if(results.status=='Successful')		
		{
		   console.log('results:::'+results);
		   var parsed_response=JSON.stringify(results);
		   console.log('parsed_response:::'+parsed_response);
		  
		   if(results.Delivery_leadtime==''||results.Delivery_leadtime==null)
		   {
		   	var delivery_lead_time = 0 ;
		   }
		   else
		   {
		   	var delivery_lead_time = results.Delivery_leadtime ;
		   }
		   if(results.Ex_Factoryleadtime==''||results.Ex_Factoryleadtime==null)
		   {
		   	var exfactory_lead_time = 0 ;
		   }
		   else
		   {
		   	var exfactory_lead_time = results.Ex_Factoryleadtime ;
		   }
		   
	           
	           var insert_query = "insert into vendor_master values('"
	           			+ results.vendor_id + "','"
	           			+ results.Firstname + "','"
	           			+ results.lastname + "','"
	           			+ results.Email + "','"
	           			+ results.Phone + "','"
	           			+ results.Address + "','"
	           			+ results.password + "','"
	           			+ results.Alt_phn + "','"
	           			+ results.Fax + "','"
	           			+ results.Company_Name + "','"
	           			+ results.Currency + "','"
	           			+ results.Shipping_origin + "','"
	           			+ results.Shipping_point + "','"
	           			+ delivery_lead_time + "','"
	           			+ exfactory_lead_time + "','"
	           			+ results.Terms + "','"
	           			+ results.Incoterms + "','"
	           			+ results.Security_ques + "','"
	           			+ results.Security_ans + "','"
	           			+ results.Delivery_method + "','"
	           			+ results.contactname + "','"
	           			+ results.Type + "','"
	           			+ results.contactno + "','"
	           			+ results.datecreated + "')";
	           /*
	           var insert_query = "insert into vendor_master values('"
	           			+ results.vendor_id + "','"
	           			+ firstname_val + "','"
	           			+ lastname_val + "','"
	           			+ email_val + "','"
	           			+ phone_val + "','"
	           			+ address_val + "','"
	           			+ password_val + "','"
	           			+ altphone_val + "','"
	           			+ fax_val + "','"
	           			+ company_name_val + "','"
	           			+ currency_val + "','"
	           			+ shipment_origin_val + "','"
	           			+ shipment_point_val + "','"
	           			+ delivery_lead_time_val + "','"
	           			+ exfactory_lead_time_val + "','"
	           			+ terms_val + "','"
	           			+ incoterm_val + "','"
	           			+ security_question_val + "','"
	           			+ security_answer_val + "','"
	           			+ delivery_method_val + "','"
	           			+ contact_name_val + "','"
	           			+ isperson_val + "','"
	           			+ contact_phone_val + "')";
	           */
		console.log("Insert Query vendor_master ::" + insert_query);
		var fields_vendor_create = {query:insert_query};
		dbs.query(null,fields_vendor_create);
		dbs.update();

	setTimeout(function () {
		var timestamp_po = "INSERT INTO timestamp VALUES('PurchaseOrder','"
					+ results.datecreated + "','"
					+ current_date + "','"
					+ results.vendor_id + "')" ;
		
		console.log("Insert Query Timestamp PO ::" + timestamp_po);
		var fields_timestamp_po_create = {query:timestamp_po};
		dbs.query(null,fields_timestamp_po_create);
		dbs.update();
		
		var timestamp_bills = "INSERT INTO timestamp VALUES('Bills','"
					+ results.datecreated + "','"
					+ current_date + "','"
					+ results.vendor_id + "')" ;
		
		console.log("Insert Query Timestamp Bills ::" + timestamp_bills);
		var fields_timestamp_bills_create = {query:timestamp_bills};
		dbs.query(null,fields_timestamp_bills_create);
		dbs.update();

		var timestamp_bill_payments = "INSERT INTO timestamp VALUES('BillPayment','"
					+ results.datecreated + "','"
					+ current_date + "','"
					+ results.vendor_id + "')" ;
		
		console.log("Insert Query Timestamp Bills ::" + timestamp_bill_payments);
		var fields_timestamp_bill_payments_create = {query:timestamp_bill_payments};
		dbs.query(null,fields_timestamp_bill_payments_create);
		dbs.update();
		
		var timestamp_ir = "INSERT INTO timestamp VALUES('ItemReceipt','"
					+ results.datecreated + "','"
					+ current_date + "','"
					+ results.vendor_id + "')" ;
		
		console.log("Insert Query Timestamp IR ::" + timestamp_ir);
		var fields_timestamp_ir_create = {query:timestamp_ir};
		dbs.query(null,fields_timestamp_ir_create);
		dbs.update();
		
		res.render('message',{
			message:results.message
		});
		},5000);
		
		}
		else
		{
			res.render('message',{
				message:results.message
			});
		}
		});
	},5000);

	
}); 

/* GET Purchase Order List Pages. */
app.get('/postatusview', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("Purchase Order status page ");
	
	//notification_flag = req.body.notification_flag;
	//console.log("Notification Flag --> " + notification_flag);
	var rec_type='PurchaseOrder';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	
		
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result)
	{
		if(result.length!=0)
		{
			console.log("result timestamp details :: "+ JSON.stringify(result));
			time_stamp = result[0].timestamp;
			console.log("time_stamp :: "+time_stamp);
		}
		else
		{
			var now = new Date();
	
			var hours=now.getHours();
					
			if(now.getHours()>12)
			{
				hours=parseInt(now.getHours())-12;
			}
			function AddZero(num) 
			{
			    return (num >= 0 && num < 10) ? "0" + num : num + "";
			}
			var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
			console.log("New Time Stamp :: " + strDateTime);
			var time_stamp = strDateTime ;
//					time_stamp = Date.now();
		}
		var rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
		console.log("Rest Params :: " + JSON.stringify(rest_params));
		function onFailure(err) {
		  process.stderr.write("Refresh Failed: " + err.message + "\n");
		  //process.exit(1);
		}
			
// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 if(results.status!='fail')		
{
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
  var header=results.status;
   	
  var data_len=results.podetails.length;
	/*if(notification_flag == 'T')
	{
		count = parseInt(data_len);
	}
	else
	{
		count = parseInt(count) + parseInt(data_len);
	}
	*/
	count = data_len;
	var newnotf = data_len + " Purchase Order added /updated";
	notdata.push(newnotf);
	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.podetails[0].itempush.length);
	console.log("tranID : "+results.podetails[0].tranID);
	console.log("item_id : "+results.podetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);

	function isItemInArray(array, item) {
	 for (var i = 0; i < array.length; i++) {
	 // This if statement depends on the format of your array
	 if (array[i][0] == item[0] && array[i][1] == item[1]) {
            return true;   // Found it
	 }
    	}
    	return false;   // Not found
	}
	
// create an arry of existing POs	
	var po_list=new Array(); 
	var fields_po_details = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('purchase_order',fields_po_details);
	dbs.readData(function (result1){
		console.log("result PO_ns_ID details :: "+ JSON.stringify(result1));
		console.log("contents length : "+result1.length);
		if(result1!=null)
		for (var i=0; i<result1.length; i++) 
		{
			po_list[i] = result1[i].po_ns_id;
		}
		console.log('po_list array::'+po_list);
	
	//var po_contents = db.exec("select PO_NS_ID from purchase_order");
// create a arry of existing POs	
	var po_line_list=new Array();
	var fields_po_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('po_lines',fields_po_lines_details);
	dbs.readData(function (result){
		console.log("result PO_NS_ID,ITEM_ID details :: "+ JSON.stringify(result));

	//var po_line_contents = db.exec("select PO_NS_ID,ITEM_ID from po_lines");
		if(result!='')
		{
	
			for(var r=0;r<result.length; r++) 
			{
				po_line_list[r]=new Array();
				po_line_list[r][0]=result[r].po_ns_id;
				po_line_list[r][1]=result[r].item_id;

			}
					console.log('po_line_list array::'+po_line_list);
		}

	
	
		
// insert or update PO and PO lines
	 for(var i=0;i<results.podetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=po_list.indexOf(parseInt(results.podetails[i].tranID));
		console.log('index of purchase order ::'+index);
		
		var order_status=results.podetails[i].ordstatus;
			console.log('order_status::'+order_status);
		var po_status=results.podetails[i].po_status;
			console.log('po_status::'+po_status);	
		var ack_check=results.podetails[i].ack_check;
			console.log('ack_check::'+ack_check);
		
		if((gl_ack=='T')&&(gl_pl=='T'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='T')&&(gl_pl=='F'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='T'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='F'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
			console.log('order_status::'+order_status);
	
			if(results.podetails[i].total=='')
			{
				var total = 0;
				console.log("Total if null :: " + total);
			}
			else 
			{
				total = results.podetails[i].total;
			}
			if(results.podetails[i].taxtotal=='')
			{
				var taxtotal = 0;
				console.log("Tax Total if null :: " + taxtotal);
			}
			else 
			{
				taxtotal = results.podetails[i].taxtotal;
			}
			if(results.podetails[i].exfact=='')
			{
				var exfact = null;
				console.log("Ex Fact if null :: " + exfact);
			}
			else 
			{
				exfact ="'" + results.podetails[i].exfact + "'";
			}
			if(results.podetails[i].wharrival=='')
			{
				var wharrival = null;
				console.log("WH Arrival if null :: " + wharrival);
			}
			else 
			{
				wharrival ="'" + results.podetails[i].wharrival + "'";
			}
			
		if(index<0)
		{
			var insert_query = "insert into purchase_order values('"
						+ results.podetails[i].tranID + "','"
						+ results.podetails[i].tranDate + "','"
						+ results.podetails[i].poNumber + "','"
						+ results.podetails[i].currency + "','" 
						+ results.podetails[i].memo + "',null"
						+ ","
						+ exfact + ","
						+ wharrival + ",'"
						+ results.podetails[i].datecreated + "','"
						+ results.podetails[i].delmethod + "','"
						+ results.podetails[i].shippoint + "','"
						+ results.podetails[i].shippingterms + "','"
						+ results.podetails[i].shipto + "','"
						+ order_status + "','"
						+ total + "','" 
						+ taxtotal + "','"
						+ id + "','"
			    			+ results.podetails[i].shippingorigin + "')" ;
			console.log("Query before insertion in Purchase Order ::" + insert_query );
			var fields_Insert_PO= {query:insert_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			 
			//client.query("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
			//db.run("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
		}
		else
		{
						
			var update_query = "update purchase_order set po_ns_id='" + results.podetails[i].tranID
						+ "',tran_date='" + results.podetails[i].tranDate
						+ "',currency='" + results.podetails[i].currency
						+ "',memo='" + results.podetails[i].memo
						+ "',ex_factory_date=" + exfact
						+ ",wh_arrival_date=" + wharrival
						+ ",delivery_method='" + results.podetails[i].delmethod
						+ "',ship_to='" + results.podetails[i].shipto
						+ "',order_status='" + order_status
						+ "',po_number='" + results.podetails[i].poNumber
						+ "',total='" + total
						+ "',shipping_point='" + results.podetails[i].shippoint
						+ "',SHIPPING_TERMS='" + results.podetails[i].shippingterms
						+ "',tax_total='" + taxtotal
						+ "',shipment_origin='" + results.podetails[i].shippingorigin
						+ "' where po_ns_id= '" + results.podetails[i].tranID
						+ "' AND vendor_ns_id::integer= '" + id
						+ "'";
			console.log("Query before updation in Purchase Order ::" + update_query );
			var fields_Insert_PO= {query:update_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			//db.run("update purchase_order set po_ns_id='"+results.podetails[i].tranID+"',tran_date='"+results.podetails[i].tranDate+"',currency='"+results.podetails[i].currency+"',memo='"+results.podetails[i].memo+"',ex_factory_date='"+results.podetails[i].exfact+"',wh_arrival_date='"+results.podetails[i].wharrival+"',delivery_method='"+results.podetails[i].delmethod+"',ship_to='"+results.podetails[i].shipto+"',order_status='"+order_status+"',po_number='"+results.podetails[i].poNumber+"',total='"+results.podetails[i].total+"',SHIPPING_TERMS='"+results.podetails[i].shippoint+"' where po_ns_id= '"+results.podetails[i].tranID+"'"); 
		
		}
		 
		 
				 for(var j=0;j<results.podetails[i].itempush.length;j++)
			{
				console.log('in j loop::'+[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(po_line_list,[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.podetails[i].itempush[j].taxamount=='')
				{
					var taxamount = 0;
					console.log("If tax amount is null :: " + taxamount );
				}
				else
				{
					var taxamount  = results.podetails[i].itempush[j].taxamount;
					console.log("TAx Amont not null :: " + taxamount);
				}
				if(results.podetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;
					console.log("If item Qty is null :: " + itemQty );
				}
				else
				{
					var itemQty  = results.podetails[i].itempush[j].itemQty;
					console.log("item Qty not null :: " + itemQty);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice<0)
				{
					var amount = results.podetails[i].itempush[j].amount*(-1);
					console.log("If amount  is negative :: " + amount );
				}
				else
				{
					var amount  = results.podetails[i].itempush[j].amount;
					console.log("amount not negative :: " + amount);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice=='')
				{
					var itemUnitPrice = 0;
					console.log("If itemUnitPrice  is null :: " + itemUnitPrice );
				}
				else
				{
					var itemUnitPrice  = results.podetails[i].itempush[j].itemUnitPrice;
					console.log("itemUnitPrice not null :: " + itemUnitPrice);
				}
				if(!is_exist)
				{
					var insert_query = "insert into po_lines values('"
								+ results.podetails[i].itempush[j].itemID + "','"
								+ results.podetails[i].itempush[j].itemName + "','"
								+ results.podetails[i].tranID + "','"
								+ results.podetails[i].itempush[j].itemDescription + "','"
								+ itemQty + "','"
								+ itemUnitPrice + "','"
								+ amount + "','"
								+ results.podetails[i].itempush[j].taxrate + "','"
								+ taxamount + "','"
								+ id + "','"
								+ results.podetails[i].itempush[j].vendorname + "')"; 
					console.log("Query before insertion in Purchase Order Lines ::" + insert_query );
					
					//db.run("insert into po_lines('po_ns_id','item_id','qty','rate','amount','item_name','description') values('"+results.podetails[i].tranID+"','"+results.podetails[i].itempush[j].itemID+"','"+results.podetails[i].itempush[j].itemQty+"','"+results.podetails[i].itempush[j].itemUnitPrice+"','"+results.podetails[i].itempush[j].amount+"','"+results.podetails[i].itempush[j].itemName+"','"+results.podetails[i].itempush[j].itemName+"')"); 
					var fields_Insert_PO= {query:insert_query};
					dbs.query('po_lines',fields_Insert_PO);
					dbs.update();
					
				}
				else
				{			
					var update_query = "update po_lines set po_ns_id='" + results.podetails[i].tranID
								+ "',item_id='" + results.podetails[i].itempush[j].itemID 
								+ "',qty='" + itemQty
								+ "',rate='" + itemUnitPrice
								+ "',amount='" + amount
								+ "',item_name='" + results.podetails[i].itempush[j].itemName
								+ "',description='"+results.podetails[i].itempush[j].itemDescription
								+ "',tax_code='" + results.podetails[i].itempush[j].taxrate
								+ "',tax_amount='" + taxamount
								+ "',supplier_reference='" + results.podetails[i].itempush[j].vendorname
								+ "' where po_ns_id= '" + results.podetails[i].tranID
								+ "' AND item_id='" + results.podetails[i].itempush[j].itemID
								+ "' AND vendor_ns_id::integer='" + id
								+ "'"; 
					console.log("Query before updation in Purchase Order Lines ::" + update_query );
				
					//db.run("update po_lines set po_ns_id='"+results.podetails[i].tranID+"',item_id='"+results.podetails[i].itempush[j].itemID+"',qty='"+results.podetails[i].itempush[j].itemQty+"',rate='"+results.podetails[i].itempush[j].itemUnitPrice+"',amount='"+results.podetails[i].itempush[j].amount+"',item_name='"+results.podetails[i].itempush[j].itemName+"',description='"+results.podetails[i].itempush[j].itemName+"' where po_ns_id= '"+results.podetails[i].tranID+"' AND item_id='"+results.podetails[i].itempush[j].itemID+"'"); 
					var fields_update_PO= {query:update_query};
					dbs.query('po_lines',fields_update_PO);
					dbs.update();
				}
			} 
		}
	});
	});	
	
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id + "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
			
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	 */
	 
 
}	

else
{
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		/*var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id + "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
		*/
}		

});
			});			
		
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");
		
	
	//console.log("vendor_id  "+req.query.vendorid);
	console.log("status  "+req.query.po_status);
	console.log("id "+id);
	console.log("vendor_name "+vendor_name);
		
//var id=req.query.vendorid;  
	var postatus=req.query.po_status;
	postatus = postatus.replace(/\'/g,"");
	console.log("without single quotes postatus :: " + postatus);
	postatus="'"+postatus+"'";
	console.log("with single quotes postatus :: " + postatus);
//var postatus='Pending';
	if(postatus=="'Pending Acknowledge'")
	{
		var page_title='Purchase Order Pending Acknowledgement';
	}
	if(postatus=="'Acknowledged'")
	{
		var page_title='Acknowledged Purchase Orders';
	}
	if(postatus=="'Pending Delivery'")
	{
		var page_title='Purchase Order Pending Delivery';	
	}
	if(postatus=="'Pending Billing'")
	{
		var page_title='Purcahse Orders Pending Billing';
	}
	if(postatus=="'Fully Billed'")
	{
		var page_title='Fully Billed Purchase Orders';
	}	
	if(postatus=="'allorder'")
	{
		var page_title='All Purchase Orders';
	}
	
	var po_number=new Array();
	var po_id=new Array();
	var po_status=new Array();
	var date_create=new Array();
	var amount=new Array();
	var time_stamp='';
	
	setTimeout(function(){
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:"'PurchaseOrder'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	//var fields_timestamp_details= {key:"rec_type",operator:"=",value:"'PurchaseOrder'"};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result1){
		console.log("result timestamp details :: "+ JSON.stringify(result1));
		if(result1.length==0)
		{
			
			var vndr={key:"VENDOR_NS_ID::integer",operator:"=",value:id};
			dbs.query('vendor_master',vndr);
			dbs.readData(function (result2){
			var dat = dt.timestamp_formatter(result2[0].date_created);
				
				
			setTimeout(function () {
			var timestamp_po = "INSERT INTO timestamp VALUES('PurchaseOrder','"
					+ dat + "','"
					+ dat + "','"
					+ result2[0].vendor_ns_id + "')" ;
		
			console.log("Insert Query Timestamp PO ::" + timestamp_po);
			var fields_timestamp_po_create = {query:timestamp_po};
			dbs.query(null,fields_timestamp_po_create);
			dbs.update();
			},3000);
			
			
			
			time_stamp = result2[0].date_created;
			console.log("current time_stamp check :: ");
			});
		}
		else
		{ 
			console.log("time_stamp check :: ");
			time_stamp = result1[0].timestamp;
			console.log("time_stamp :: "+time_stamp);			
		}
		

	if(postatus=="'allorder'")
	{
		console.log("status is all orders");
		var fields_postatus_allorders= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
		dbs.query('purchase_order',fields_postatus_allorders);
		dbs.readData(function (result){
		console.log("result purchase order details with status all orders :: "+ JSON.stringify(result));
		//time_stamp = result[0].localtime;
		
		if(result != null)
		{
			console.log("contents length : ");
			for (var i=0; i<result.length; i++) 
			{
				po_id[i] = result[i].po_ns_id; 
				po_number[i] = result[i].po_number;
				po_status[i] = result[i].order_status; 
				date_create[i] = dt.date_formatter(result[i].tran_date);
				amount[i] = result[i].total;
				console.log("po_number "+po_number);
				console.log("po_status "+po_status);
				console.log("date_create "+date_create);
				console.log("amount "+amount);
	
				console.log("*****************************");
			}
			
			 res.render('postatusview', { //render the index.ejs
	 
			 tran_no:po_number,
	  		 tran_id:po_id,
			 tran_status:po_status,
	  		 tran_date:date_create,
	  		 tran_amount:amount,
	   		 title:page_title,
	  		 vendorname:vendor_name,
	  		 v_id:id,
			 notdata_rend:notdata,
	  		 count_rend:count,
	  		 statuspo:postatus,
	  		 time_stamp_val:time_stamp,
	  		 contentlength:result.length
	  
  			});
		}
		else
		{
			res.render('postatusview',{
			 	 contentlength:0,
				 title:page_title,
				 statuspo:postatus,
				 vendorname:vendor_name,
			 	 time_stamp_val:time_stamp,
				
				 notdata_rend:notdata,
	  			 count_rend:count,
				 v_id:id
			});
		}	
		//},5000);
	});
	}
	

	else
	{
		var fields_postatus_details= {key:"order_status",operator:"=",value:postatus,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('purchase_order',fields_postatus_details);
		dbs.readData(function (result){
		console.log("result purchase order details :: "+ JSON.stringify(result));
		
		//time_stamp = result[0].localtime;
		//setTimeout(function () {
		if(result != null)
		{
			console.log("result length :: " + result.length);
			for (var i=0; i<result.length; i++) 
			{
				po_id[i] = result[i].po_ns_id; 
				po_number[i] = result[i].po_number;
				po_status[i] = result[i].order_status; 
				date_create[i] = dt.date_formatter(result[i].tran_date);
				amount[i] = result[i].total;
		
				console.log("po_number "+po_number);
				console.log("po_status "+po_status);
				console.log("date_create "+date_create);
				console.log("amount "+amount);
	
				console.log("*****************************");
			}
			
			 res.render('postatusview', { //render the index.ejs
	 
			 tran_no:po_number,
	  		 tran_id:po_id,
			 tran_status:po_status,
	  		 tran_date:date_create,
	  		 tran_amount:amount,
	   		 title:page_title,
	  		 vendorname:vendor_name,
	  		 
			 v_id:id,
			 notdata_rend:notdata,
	  		 count_rend:count,
	  		 
			 statuspo:postatus,
	  		 time_stamp_val:time_stamp,
	  		 contentlength:result.length
	  
  			});
		}
		else
		{
			res.render('postatusview',{
			 	 contentlength:0,
				 title:page_title,
				 statuspo:postatus,
				 vendorname:vendor_name,
			 	 time_stamp_val:time_stamp,
			
				 notdata_rend:notdata,
	  			 count_rend:count,
				 v_id:id
			});
		}	
		
		});
}

	});
	},3000);
}
else
{
	res.render('signout',{});
}
});

/* GET poview page*/
app.get('/poview', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("PO View page ");

	var rec_type='PurchaseOrder';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	
	po_ns_id=req.query.po_ns_id;
	console.log("po_ns_id  "+po_ns_id);
	
		
	var rest_params = {"vendor_id":id,"event":"refresh","po_id_ns":po_ns_id};
	function onFailure(err) {
  	 process.stderr.write("Refresh Failed: " + err.message + "\n");
  	 process.exit(1);
	}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 if(results.status!='fail')		
{
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
 // var header=results.status;
   
  var data_len=results.podetails.length;
		
//	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.podetails[0].itempush.length);
	console.log("tranID : "+results.podetails[0].tranID);
	console.log("item_id : "+results.podetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);

	function isItemInArray(array, item) {
	   for (var i = 0; i < array.length; i++) {
	       // This if statement depends on the format of your array
	      if (array[i][0] == item[0] && array[i][1] == item[1]) {
	           return true;   // Found it
	       }
	    }
	    return false;   // Not found
	}
	
// create an arry of existing POs	
	var po_list=new Array();
	var fields_purchase_order = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('purchase_order',fields_purchase_order);
	dbs.readData(function (result1){
		console.log("result PO_ns_ID details :: "+ JSON.stringify(result1));
		console.log("contents length : "+result1.length);
		if(result1!=null)
		for (var i=0; i<result1.length; i++) 
		{
			po_list[i] = result1[i].po_ns_id;
		}
		console.log('po_list array::'+po_list);

	//var po_contents = db.exec("select PO_NS_ID from purchase_order");
// create a arry of existing POs	
	var po_line_list=new Array();
	var fields_po_line_list = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('po_lines',fields_po_line_list);
	dbs.readData(function (result){
		console.log("result PO_NS_ID,ITEM_ID details :: "+ JSON.stringify(result));

	//var po_line_contents = db.exec("select PO_NS_ID,ITEM_ID from po_lines");
		if(result!='')
		{
	
			for(var r=0;r<result.length; r++) 
			{
				po_line_list[r]=new Array();
				po_line_list[r][0]=result[r].po_ns_id;
				po_line_list[r][1]=result[r].item_id;

			}
					console.log('po_line_list array::'+po_line_list);
		}
	
	
	
		
// insert or update PO and PO lines
	 for(var i=0;i<results.podetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=po_list.indexOf(parseInt(results.podetails[i].tranID));
		console.log('index::'+index);
		
		var order_status=results.podetails[i].ordstatus;
			console.log('order_status::'+order_status);
		var po_status=results.podetails[i].po_status;
			console.log('po_status::'+ po_status);			
		var ack_check=results.podetails[i].ack_check;
			console.log('ack_check::'+ack_check);
		
			if((gl_ack=='T')&&(gl_pl=='T'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='T')&&(gl_pl=='F'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='T'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='F'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
			console.log('order_status::'+order_status);
	
		if(results.podetails[i].total=='')
		{
			var total = 0;
			console.log("Total if null :: " + total);
		}
		else 
		{
			total = results.podetails[i].total;
		}
		if(results.podetails[i].taxtotal=='')
		{
			var taxtotal = 0;
			console.log("Tax Total if null :: " + taxtotal);
		}
		else 
		{
			taxtotal = results.podetails[i].taxtotal;
		}
		if(results.podetails[i].exfact=='')
		{
			var exfact = null;
			console.log("Exfact if null :: " + exfact);
		}
		else 
		{
			exfact ="'" + results.podetails[i].exfact + "'";
		}
		if(results.podetails[i].wharrival=='')
		{
			var wharrival = null;
			console.log("WH Arrival if null :: " + wharrival);
		}
		else 
		{
			wharrival ="'" + results.podetails[i].wharrival + "'";
		}
		if(index<0)
		{
			var insert_query = "insert into purchase_order values('"
						+ results.podetails[i].tranID + "','"
						+ results.podetails[i].tranDate + "','"
						+ results.podetails[i].poNumber + "','"
						+ results.podetails[i].currency + "','" 
						+ results.podetails[i].memo + "',null"
						+ ","
						+ exfact + ","
						+ wharrival + ",'"
						+ results.podetails[i].datecreated + "','"
						+ results.podetails[i].delmethod + "','"
						+ results.podetails[i].shippoint + "','"
						+ results.podetails[i].shippingterms + "','"
						+ results.podetails[i].shipto + "','"
						+ order_status + "','"
						+ total + "','" 
						+ taxtotal + "','"
						+ id + "','"
			    			+ results.podetails[i].shippingorigin + "')" ;
			console.log("Query before insertion in Purchase Order ::" + insert_query );
			var fields_Insert_PO= {query:insert_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			 
			//client.query("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
			//db.run("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
		}
		else
		{
						
			var update_query = "update purchase_order set po_ns_id='" + results.podetails[i].tranID
						+ "',tran_date='" + results.podetails[i].tranDate
						+ "',currency='" + results.podetails[i].currency
						+ "',memo='" + results.podetails[i].memo
						+ "',ex_factory_date=" + exfact
						+ ",wh_arrival_date=" + wharrival
						+ ",delivery_method='" + results.podetails[i].delmethod
						+ "',ship_to='" + results.podetails[i].shipto
						+ "',order_status='" + order_status
						+ "',po_number='" + results.podetails[i].poNumber
						+ "',total='" + total
						+ "',shipping_point='" + results.podetails[i].shippoint
						+ "',SHIPPING_TERMS='" + results.podetails[i].shippingterms
						+ "',tax_total='" + taxtotal
						+ "',shipment_origin='" + results.podetails[i].shippingorigin
						+ "' where po_ns_id= '" + results.podetails[i].tranID
						+ "' AND vendor_ns_id::integer= '" + id
						+ "'"; 
			console.log("Query before updation in Purchase Order ::" + update_query );
			var fields_Insert_PO= {query:update_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			//db.run("update purchase_order set po_ns_id='"+results.podetails[i].tranID+"',tran_date='"+results.podetails[i].tranDate+"',currency='"+results.podetails[i].currency+"',memo='"+results.podetails[i].memo+"',ex_factory_date='"+results.podetails[i].exfact+"',wh_arrival_date='"+results.podetails[i].wharrival+"',delivery_method='"+results.podetails[i].delmethod+"',ship_to='"+results.podetails[i].shipto+"',order_status='"+order_status+"',po_number='"+results.podetails[i].poNumber+"',total='"+results.podetails[i].total+"',SHIPPING_TERMS='"+results.podetails[i].shippoint+"' where po_ns_id= '"+results.podetails[i].tranID+"'"); 
		
		}
		 
		 
				 for(var j=0;j<results.podetails[i].itempush.length;j++)
			{
				console.log('in j loop::'+[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(po_line_list,[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.podetails[i].itempush[j].taxamount=='')
				{
					var taxamount = 0;
					console.log("If tax amount is null :: " + taxamount );
				}
				else
				{
					var taxamount  = results.podetails[i].itempush[j].taxamount;
					console.log("TAx Amont not null :: " + taxamount);
				}
				if(results.podetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;
					console.log("If item Qty is null :: " + itemQty );
				}
				else
				{
					var itemQty  = results.podetails[i].itempush[j].itemQty;
					console.log("item Qty not null :: " + itemQty);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice<0)
				{
					var amount = results.podetails[i].itempush[j].amount*(-1);
					console.log("If amount  is negative :: " + amount );
				}
				else
				{
					var amount  = results.podetails[i].itempush[j].amount;
					console.log("amount not negative :: " + amount);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice=='')
				{
					var itemUnitPrice = 0;
					console.log("If itemUnitPrice  is null :: " + itemUnitPrice );
				}
				else
				{
					var itemUnitPrice  = results.podetails[i].itempush[j].itemUnitPrice;
					console.log("itemUnitPrice not null :: " + itemUnitPrice);
				}
				if(!is_exist)
				{
					var insert_query = "insert into po_lines values('"
								+ results.podetails[i].itempush[j].itemID + "','"
								+ results.podetails[i].itempush[j].itemName + "','"
								+ results.podetails[i].tranID + "','"
								+ results.podetails[i].itempush[j].itemDescription + "','"
								+ itemQty + "','"
								+ itemUnitPrice + "','"
								+ amount + "','"
								+ results.podetails[i].itempush[j].taxrate + "','"
								+ taxamount + "','"
								+ id + "','"
								+ results.podetails[i].itempush[j].vendorname + "')";
					//db.run("insert into po_lines('po_ns_id','item_id','qty','rate','amount','item_name','description') values('"+results.podetails[i].tranID+"','"+results.podetails[i].itempush[j].itemID+"','"+results.podetails[i].itempush[j].itemQty+"','"+results.podetails[i].itempush[j].itemUnitPrice+"','"+results.podetails[i].itempush[j].amount+"','"+results.podetails[i].itempush[j].itemName+"','"+results.podetails[i].itempush[j].itemName+"')"); 
					console.log("Query before insertion in Purchase Order Lines ::" + insert_query );
					var fields_Insert_PO= {query:insert_query};
					dbs.query('po_lines',fields_Insert_PO);
					dbs.update();
					
				}
				else
				{			
					var update_query = "update po_lines set po_ns_id='" + results.podetails[i].tranID
								+ "',item_id='" + results.podetails[i].itempush[j].itemID 
								+ "',qty='" + itemQty
								+ "',rate='" + itemUnitPrice
								+ "',amount='" + amount
								+ "',item_name='" + results.podetails[i].itempush[j].itemName
								+ "',description='"+results.podetails[i].itempush[j].itemDescription
								+ "',tax_code='" + results.podetails[i].itempush[j].taxrate
								+ "',tax_amount='" + taxamount
								+ "',supplier_reference='" + results.podetails[i].itempush[j].vendorname
								+ "' where po_ns_id= '" + results.podetails[i].tranID
								+ "' AND item_id='" + results.podetails[i].itempush[j].itemID
								+ "' AND vendor_ns_id::integer='" + id
								+ "'"; 
					console.log("Query before updation in Purchase Order Lines ::" + update_query );
					//db.run("update po_lines set po_ns_id='"+results.podetails[i].tranID+"',item_id='"+results.podetails[i].itempush[j].itemID+"',qty='"+results.podetails[i].itempush[j].itemQty+"',rate='"+results.podetails[i].itempush[j].itemUnitPrice+"',amount='"+results.podetails[i].itempush[j].amount+"',item_name='"+results.podetails[i].itempush[j].itemName+"',description='"+results.podetails[i].itempush[j].itemName+"' where po_ns_id= '"+results.podetails[i].tranID+"' AND item_id='"+results.podetails[i].itempush[j].itemID+"'"); 
					var fields_update_PO= {query:update_query};
					dbs.query('po_lines',fields_update_PO);
					dbs.update();
				}
			} 
		}
	});
	});	
	
/*		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		var update_query = "update timestamp set timestamp='"+results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id
					+ "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
*/

		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	 */
	 
 
}	
		});
	
		setTimeout(function(){
		var fields_po_ns_details= {key:"PO_NS_ID",operator:"=",value:po_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('purchase_order',fields_po_ns_details);
		dbs.readData(function (result){
		console.log("result PO_ns_details details :: "+ JSON.stringify(result));
		console.log("contents length : "+result.length);
		for (var i=0; i<result.length; i++) 
		{
			po_ns_id_val= result[i].po_ns_id;
			trandate_val = dt.date_formatter(result[i].tran_date); 
			ponum_val = result[i].po_number;
			curreny_val = result[i].currency;
			memo_val = result[i].memo;
			ack_date_val = dt.date_formatter(result[i].ack_date);
			ex_fact_date_val = dt.date_formatter(result[i].ex_factory_date);
			wh_arriaval_date_val = dt.date_formatter(result[i].wh_arrival_date);
			date_created_val = dt.date_formatter(result[i].date_created);
			console.log("Date Created --> " + result[i].date_created + "Date  created Val " + date_created_val);
			delivery_method_val = result[i].delivery_method;
			shipping_pt_val = result[i].shipping_point;
			shipping_term_val = result[i].shipping_terms;
			ship_to_val = result[i].ship_to;
			order_status_val = result[i].order_status;
			//response_status_val = result[i].response_status;
			//timestamp_val = result[i].timestamp;
			total_val=result[i].total;
			
		} 
		
		//time_stamp = result[0].local_time;
		//console.log("time_stamp :: "+time_stamp);
		

		
		/*
		var conString = process.env.DATABASE_URL ;
		var client = new pg.Client(conString);
		client.connect();
		var contents = client.query("select * from purchase_order where PO_NS_ID = "+po_ns_id);
		contents.on("end", function (result) {          
		console.log('Purchase Order View');
		client.end();
			
		});
		*/
		//var contents = db.exec("select * from purchase_order where PO_NS_ID = "+po_ns_id);
		
	
		
		/*
		var conString = process.env.DATABASE_URL ;
		var client = new pg.Client(conString);
		client.connect();
		var po_line_contents = client.query("select * from po_lines where PO_NS_ID = "+po_ns_id);
		contents.on("end", function (result) {          
		console.log('Purchase Order View');
		client.end();
			
		});
		*/
		//var po_line_contents = db.exec("select * from po_lines where PO_NS_ID = "+po_ns_id);
		
		var fields_po_line_contents= {key:"PO_NS_ID",operator:"=",value:po_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('po_lines',fields_po_line_contents);
		dbs.readData(function (result){
		console.log("result PO_line_details :: "+ JSON.stringify(result));
		console.log("po_line_contents length : "+result.length);
		
		var items_data = new Array();
		if(result!=null)
		{
			for (var i=0; i<result.length; i++) 
			{
				var item = new Object();
			
				item.item_id_val= result[i].item_id;
				console.log("item.item_id_val  "+item.item_id_val);
			
				item.item_name_val = result[i].item_name; 
				item.po_ns_id_val = result[i].po_ns_id;
				var description_val = result[i].description;
				if(description_val=='null')
				{
					item.description_val = ' ';
				}
				else
				{
					item.description_val = description_val;
				}
				item.quantity_val = result[i].qty;
				item.rate_val = result[i].rate;
				item.amount_val = result[i].amount; 
				item.tax_code_summ_val = result[i].tax_code;
				item.tax_amt_val = result[i].tax_amount;
				item.supplier_reference_val = result[i].supplier_reference;
				items_data.push(item);
			
			}  
		
		console.log("items_data "+items_data);
		console.log("items_data "+JSON.stringify(items_data));
		setTimeout(function(){
			res.render('poview', { //render the index.ejs
	 
	 	v_id:id,
		notdata_rend:notdata,
	  	count_rend:count,
		gl_pl_rend:gl_pl,		
	 	vendorname:vendor_name,
	 	po_internal_id:po_ns_id,
	  	po_num:ponum_val,
		date_created:date_created_val,
	  	ship_to:ship_to_val,
	  	ex_fact_date:ex_fact_date_val,
	  	wh_arriaval_date:wh_arriaval_date_val,
	  	delivery_method:delivery_method_val,
	  	shipping_pt:shipping_pt_val,
	  	shipping_term:shipping_term_val,
	  	items:items_data,
	  	line_length:result.length,
	  	order_status:order_status_val
  		});
		},1000);
	}

	else
	{
		res.render('poview', { //render the index.ejs
	 
	  	v_id:id,
		notdata_rend:notdata,
	  	count_rend:count,
		gl_pl_rend:gl_pl,	
		vendorname:vendor_name,
	  	po_internal_id:po_ns_id,
	  	po_num:ponum_val,
	  	date_created:date_created_val,
	  	ship_to:ship_to_val,
	  	ex_fact_date:ex_fact_date_val,
	  	wh_arriaval_date:wh_arriaval_date_val,
	  	delivery_method:delivery_method_val,
	  	shipping_pt:shipping_pt_val,
	  	shipping_term:shipping_term_val,
	  	line_length:0,
	  	order_status:order_status_val
	  
  		});
	}
	
	});
});
},3000);
}
		
	/*	if(po_line_contents!='')
		{
		console.log("po_line_contents length : "+po_line_contents[0]["values"].length);
		for (var i=0; i<po_line_contents[0]["values"].length; i++) 
		{
			var item = new Object();
			
			item.item_id_val= po_line_contents[0]["values"][i][0];
			console.log("item.item_id_val  "+item.item_id_val);
			
			item.item_name_val = po_line_contents[0]["values"][i][1]; 
			item.po_ns_id_val = po_line_contents[0]["values"][i][2];
			item.description_val = po_line_contents[0]["values"][i][3];
			item.quantity_val = po_line_contents[0]["values"][i][4];
			item.rate_val = po_line_contents[0]["values"][i][5];
			item.amount_val = po_line_contents[0]["values"][i][6]; 
			item.tax_code_summ_val = po_line_contents[0]["values"][i][8];
			item.tax_amt_val = po_line_contents[0]["values"][i][9]; 
			items_data.push(item);
			
		}  
		
		console.log("items_data "+items_data);
		console.log("items_data "+JSON.stringify(items_data));
	*/

else
{
	res.render('signout',{});
}
	
});

/*GET refresh page for PO */
app.get('/refresh', requireLogin, function(req, res, next) {
	
	if(id)
{
		
	console.log("Purchase Order Refresh page ");
	
	//RecordType.rec_type=req.query.record_type;
	var rec_type=req.query.record_type;
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	var postatus=req.query.po_status;
	console.log("postatus  "+ postatus);
	rec_type = "'" + rec_type + "'";
	if(postatus!='none')	
	{
		
		var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		console.log('Before timestamp details :: ');
		dbs.query('timestamp',fields_timestamp_details);
		dbs.readData(function (result)
			{
				if(result.length!=0){
				console.log("result timestamp details :: "+ JSON.stringify(result));
				time_stamp = result[0].timestamp;
				console.log("time_stamp :: "+time_stamp);
				}
				else
				{
					var now = new Date();
	
					var hours=now.getHours();
					
					if(now.getHours()>12)
					{
						hours=parseInt(now.getHours())-12;
					}
					function AddZero(num) 
					{
					    return (num >= 0 && num < 10) ? "0" + num : num + "";
					}
					var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
					console.log("New Time Stamp :: " + strDateTime);
					var time_stamp = strDateTime ;
//					time_stamp = Date.now();
				}
			var rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
			console.log("Rest Params :: " + JSON.stringify(rest_params));
			function onFailure(err) {
			  process.stderr.write("Refresh Failed: " + err.message + "\n");
			  //process.exit(1);
			}
			
// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 if(results.status!='fail')		
{
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
  var header=results.status;
   	
  var data_len=results.podetails.length;
		
	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.podetails[0].itempush.length);
	console.log("tranID : "+results.podetails[0].tranID);
	console.log("item_id : "+results.podetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);

	function isItemInArray(array, item) {
	 for (var i = 0; i < array.length; i++) {
	 // This if statement depends on the format of your array
	 if (array[i][0] == item[0] && array[i][1] == item[1]) {
            return true;   // Found it
	 }
    	}
    	return false;   // Not found
	}
	
// create an arry of existing POs	
	var po_list=new Array(); 
	var fields_po_details = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('purchase_order',fields_po_details);
	dbs.readData(function (result1){
		console.log("result PO_ns_ID details :: "+ JSON.stringify(result1));
		console.log("contents length : "+result1.length);
		if(result1!=null)
		for (var i=0; i<result1.length; i++) 
		{
			po_list[i] = result1[i].po_ns_id;
		}
		console.log('po_list array::'+po_list);
	
	//var po_contents = db.exec("select PO_NS_ID from purchase_order");
// create a arry of existing POs	
	var po_line_list=new Array();
	var fields_po_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('po_lines',fields_po_lines_details);
	dbs.readData(function (result){
		console.log("result PO_NS_ID,ITEM_ID details :: "+ JSON.stringify(result));

	//var po_line_contents = db.exec("select PO_NS_ID,ITEM_ID from po_lines");
		if(result!='')
		{
	
			for(var r=0;r<result.length; r++) 
			{
				po_line_list[r]=new Array();
				po_line_list[r][0]=result[r].po_ns_id;
				po_line_list[r][1]=result[r].item_id;

			}
					console.log('po_line_list array::'+po_line_list);
		}

	
	
		
// insert or update PO and PO lines
	 for(var i=0;i<results.podetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=po_list.indexOf(parseInt(results.podetails[i].tranID));
		console.log('index of purchase order ::'+index);
		
		var order_status=results.podetails[i].ordstatus;
			console.log('order_status::'+order_status);
		var ack_check=results.podetails[i].ack_check;
			console.log('ack_check::'+ack_check);
		var po_status=results.podetails[i].po_status;
			console.log('po_status::'+ po_status);	
		
			if((gl_ack=='T')&&(gl_pl=='T'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='T')&&(gl_pl=='F'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='T'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='F'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
			console.log('order_status::'+order_status);
	
			if(results.podetails[i].total=='')
			{
				var total = 0;
				console.log("Total if null :: " + total);
			}
			else 
			{
				total = results.podetails[i].total;
			}
			if(results.podetails[i].taxtotal=='')
			{
				var taxtotal = 0;
				console.log("Tax Total if null :: " + taxtotal);
			}
			else 
			{
				taxtotal = results.podetails[i].taxtotal;
			}
			if(results.podetails[i].exfact=='')
			{
				var exfact = null;
				console.log("Ex Fact if null :: " + exfact);
			}
			else 
			{
				exfact ="'" + results.podetails[i].exfact + "'";
			}
			if(results.podetails[i].wharrival=='')
			{
				var wharrival = null;
				console.log("WH Arrival if null :: " + wharrival);
			}
			else 
			{
				wharrival ="'" + results.podetails[i].wharrival + "'";
			}
			
		if(index<0)
		{
			var insert_query = "insert into purchase_order values('"
						+ results.podetails[i].tranID + "','"
						+ results.podetails[i].tranDate + "','"
						+ results.podetails[i].poNumber + "','"
						+ results.podetails[i].currency + "','" 
						+ results.podetails[i].memo + "',null"
						+ ","
						+ exfact + ","
						+ wharrival + ",'"
						+ results.podetails[i].datecreated + "','"
						+ results.podetails[i].delmethod + "','"
						+ results.podetails[i].shippoint + "','"
						+ results.podetails[i].shippingterms + "','"
						+ results.podetails[i].shipto + "','"
						+ order_status + "','"
						+ total + "','" 
						+ taxtotal + "','"
						+ id + "','"
			    			+ results.podetails[i].shippingorigin + "')" ;
			console.log("Query before insertion in Purchase Order ::" + insert_query );
			var fields_Insert_PO= {query:insert_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			 
			//client.query("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
			//db.run("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
		}
		else
		{
						
			var update_query = "update purchase_order set po_ns_id='" + results.podetails[i].tranID
						+ "',tran_date='" + results.podetails[i].tranDate
						+ "',currency='" + results.podetails[i].currency
						+ "',memo='" + results.podetails[i].memo
						+ "',ex_factory_date=" + exfact
						+ ",wh_arrival_date=" + wharrival
						+ ",delivery_method='" + results.podetails[i].delmethod
						+ "',ship_to='" + results.podetails[i].shipto
						+ "',order_status='" + order_status
						+ "',po_number='" + results.podetails[i].poNumber
						+ "',total='" + total
						+ "',shipping_point='" + results.podetails[i].shippoint
						+ "',SHIPPING_TERMS='" + results.podetails[i].shippingterms
						+ "',tax_total='" + taxtotal
						+ "',shipment_origin='" + results.podetails[i].shippingorigin 
						+ "' where po_ns_id= '" + results.podetails[i].tranID
						+ "' AND vendor_ns_id::integer= '" + id
						+ "'";
			console.log("Query before updation in Purchase Order ::" + update_query );
			var fields_Insert_PO= {query:update_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			//db.run("update purchase_order set po_ns_id='"+results.podetails[i].tranID+"',tran_date='"+results.podetails[i].tranDate+"',currency='"+results.podetails[i].currency+"',memo='"+results.podetails[i].memo+"',ex_factory_date='"+results.podetails[i].exfact+"',wh_arrival_date='"+results.podetails[i].wharrival+"',delivery_method='"+results.podetails[i].delmethod+"',ship_to='"+results.podetails[i].shipto+"',order_status='"+order_status+"',po_number='"+results.podetails[i].poNumber+"',total='"+results.podetails[i].total+"',SHIPPING_TERMS='"+results.podetails[i].shippoint+"' where po_ns_id= '"+results.podetails[i].tranID+"'"); 
		
		}
		 
		 
				 for(var j=0;j<results.podetails[i].itempush.length;j++)
			{
				console.log('in j loop::'+[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(po_line_list,[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.podetails[i].itempush[j].taxamount=='')
				{
					var taxamount = 0;
					console.log("If tax amount is null :: " + taxamount );
				}
				else
				{
					var taxamount  = results.podetails[i].itempush[j].taxamount;
					console.log("TAx Amont not null :: " + taxamount);
				}
				if(results.podetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;
					console.log("If item Qty is null :: " + itemQty );
				}
				else
				{
					var itemQty  = results.podetails[i].itempush[j].itemQty;
					console.log("item Qty not null :: " + itemQty);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice<0)
				{
					var amount = results.podetails[i].itempush[j].amount*(-1);
					console.log("If amount  is negative :: " + amount );
				}
				else
				{
					var amount  = results.podetails[i].itempush[j].amount;
					console.log("amount not negative :: " + amount);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice=='')
				{
					var itemUnitPrice = 0;
					console.log("If itemUnitPrice  is null :: " + itemUnitPrice );
				}
				else
				{
					var itemUnitPrice  = results.podetails[i].itempush[j].itemUnitPrice;
					console.log("itemUnitPrice not null :: " + itemUnitPrice);
				}
				if(!is_exist)
				{
					var insert_query = "insert into po_lines values('"
								+ results.podetails[i].itempush[j].itemID + "','"
								+ results.podetails[i].itempush[j].itemName + "','"
								+ results.podetails[i].tranID + "','"
								+ results.podetails[i].itempush[j].itemDescription + "','"
								+ itemQty + "','"
								+ itemUnitPrice + "','"
								+ amount + "','"
								+ results.podetails[i].itempush[j].taxrate + "','"
								+ taxamount + "','"
								+ id + "','" 
								+ results.podetails[i].itempush[j].vendorname + "')"; 
					console.log("Query before insertion in Purchase Order Lines ::" + insert_query );
					
					//db.run("insert into po_lines('po_ns_id','item_id','qty','rate','amount','item_name','description') values('"+results.podetails[i].tranID+"','"+results.podetails[i].itempush[j].itemID+"','"+results.podetails[i].itempush[j].itemQty+"','"+results.podetails[i].itempush[j].itemUnitPrice+"','"+results.podetails[i].itempush[j].amount+"','"+results.podetails[i].itempush[j].itemName+"','"+results.podetails[i].itempush[j].itemName+"')"); 
					var fields_Insert_PO= {query:insert_query};
					dbs.query('po_lines',fields_Insert_PO);
					dbs.update();
					
				}
				else
				{			
					var update_query = "update po_lines set po_ns_id='" + results.podetails[i].tranID
								+ "',item_id='" + results.podetails[i].itempush[j].itemID 
								+ "',qty='" + itemQty
								+ "',rate='" + itemUnitPrice
								+ "',amount='" + amount
								+ "',item_name='" + results.podetails[i].itempush[j].itemName
								+ "',description='"+results.podetails[i].itempush[j].itemDescription
								+ "',tax_code='" + results.podetails[i].itempush[j].taxrate
								+ "',tax_amount='" + taxamount
								+ "',supplier_reference='" + results.podetails[i].itempush[j].vendorname
								+ "' where po_ns_id= '" + results.podetails[i].tranID
								+ "' AND item_id='" + results.podetails[i].itempush[j].itemID
								+ "' AND vendor_ns_id::integer='" + id
								+ "'"; 
					console.log("Query before updation in Purchase Order Lines ::" + update_query );
				
					//db.run("update po_lines set po_ns_id='"+results.podetails[i].tranID+"',item_id='"+results.podetails[i].itempush[j].itemID+"',qty='"+results.podetails[i].itempush[j].itemQty+"',rate='"+results.podetails[i].itempush[j].itemUnitPrice+"',amount='"+results.podetails[i].itempush[j].amount+"',item_name='"+results.podetails[i].itempush[j].itemName+"',description='"+results.podetails[i].itempush[j].itemName+"' where po_ns_id= '"+results.podetails[i].tranID+"' AND item_id='"+results.podetails[i].itempush[j].itemID+"'"); 
					var fields_update_PO= {query:update_query};
					dbs.query('po_lines',fields_update_PO);
					dbs.update();
				}
			} 
		}
	});
	});	
	
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id + "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
			
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	 */
	 
 
}	

else
{
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		/*var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id + "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
		*/
}		

});
	
if(postatus!='none')
{
	setTimeout(function () {
           res.redirect(303,'/postatusview?po_status='+postatus+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
	
}
else
{
	setTimeout(function () {
           res.redirect(303,'/poview?po_ns_id='+poid+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
	
}
		});			
		
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");


			//var rest_params = {"vendor_id":vendor_name,"event":"refresh","timestamp":time_stamp};
	}
	else
	{
		var poid=req.query.po_id;
		console.log("poid  "+poid);
		
		var rest_params = {"vendor_id":id,"event":"refresh","po_id_ns":poid};
		function onFailure(err) {
  process.stderr.write("Refresh Failed: " + err.message + "\n");
  //process.exit(1);
}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 if(results.status!='fail')		
{
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
 // var header=results.status;
   
  var data_len=results.podetails.length;
		
//	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.podetails[0].itempush.length);
	console.log("tranID : "+results.podetails[0].tranID);
	console.log("item_id : "+results.podetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);

	function isItemInArray(array, item) {
	   for (var i = 0; i < array.length; i++) {
	       // This if statement depends on the format of your array
	      if (array[i][0] == item[0] && array[i][1] == item[1]) {
	           return true;   // Found it
	       }
	    }
	    return false;   // Not found
	}
	
// create an arry of existing POs	
	var po_list=new Array();
	var fields_purchase_order = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('purchase_order',fields_purchase_order);
	dbs.readData(function (result1){
		console.log("result PO_ns_ID details :: "+ JSON.stringify(result1));
		console.log("contents length : "+result1.length);
		if(result1!=null)
		for (var i=0; i<result1.length; i++) 
		{
			po_list[i] = result1[i].po_ns_id;
		}
		console.log('po_list array::'+po_list);

	//var po_contents = db.exec("select PO_NS_ID from purchase_order");
// create a arry of existing POs	
	var po_line_list=new Array();
	var fields_po_line_list = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('po_lines',fields_po_line_list);
	dbs.readData(function (result){
		console.log("result PO_NS_ID,ITEM_ID details :: "+ JSON.stringify(result));

	//var po_line_contents = db.exec("select PO_NS_ID,ITEM_ID from po_lines");
		if(result!='')
		{
	
			for(var r=0;r<result.length; r++) 
			{
				po_line_list[r]=new Array();
				po_line_list[r][0]=result[r].po_ns_id;
				po_line_list[r][1]=result[r].item_id;

			}
					console.log('po_line_list array::'+po_line_list);
		}
	
	
	
		
// insert or update PO and PO lines
	 for(var i=0;i<results.podetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=po_list.indexOf(parseInt(results.podetails[i].tranID));
		console.log('index::'+index);
		
		var order_status=results.podetails[i].ordstatus;
			console.log('order_status::'+order_status);
		var po_status=results.podetails[i].po_status;
			console.log('po_status::'+po_status);	
		var ack_check=results.podetails[i].ack_check;
			console.log('ack_check::'+ack_check);
		
			if((gl_ack=='T')&&(gl_pl=='T'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='T')&&(gl_pl=='F'))
		{
			if(order_status=='pendingReceipt' && ack_check=='F' )
			{
				order_status='Pending Acknowledge';
			}
			else if(order_status=='pendingReceipt' && ack_check=='T' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='T'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if((order_status=='pendingReceipt'||order_status=='partiallyReceived')&&(po_status=='Pending Delivery'))
			{
				order_status='Pending Delivery';
			}
		}
		if((gl_ack=='F')&&(gl_pl=='F'))
		{

			if(order_status=='pendingReceipt' && po_status!='Pending Delivery')
			{
				order_status='Acknowledged';
			}
			else if(order_status=='pendingBillPartReceived' || order_status=='pendingBilling' )
			{
				order_status='Pending Billing';
			}
			else if(order_status=='fullyBilled')
			{
				order_status='Fully Billed';
			}
			else if(order_status=='partiallyReceived')
			{
				order_status='Pending Delivery';
			}
		}
			console.log('order_status::'+order_status);
	
		if(results.podetails[i].total=='')
		{
			var total = 0;
			console.log("Total if null :: " + total);
		}
		else 
		{
			total = results.podetails[i].total;
		}
		if(results.podetails[i].taxtotal=='')
		{
			var taxtotal = 0;
			console.log("Tax Total if null :: " + taxtotal);
		}
		else 
		{
			taxtotal = results.podetails[i].taxtotal;
		}
		if(results.podetails[i].exfact=='')
		{
			var exfact = null;
			console.log("Exfact if null :: " + exfact);
		}
		else 
		{
			exfact ="'" + results.podetails[i].exfact + "'";
		}
		if(results.podetails[i].wharrival=='')
		{
			var wharrival = null;
			console.log("WH Arrival if null :: " + wharrival);
		}
		else 
		{
			wharrival ="'" + results.podetails[i].wharrival + "'";
		}
		if(index<0)
		{
			var insert_query = "insert into purchase_order values('"
						+ results.podetails[i].tranID + "','"
						+ results.podetails[i].tranDate + "','"
						+ results.podetails[i].poNumber + "','"
						+ results.podetails[i].currency + "','" 
						+ results.podetails[i].memo + "',null"
						+ ","
						+ exfact + ","
						+ wharrival + ",'"
						+ results.podetails[i].datecreated + "','"
						+ results.podetails[i].delmethod + "','"
						+ results.podetails[i].shippoint + "','"
						+ results.podetails[i].shippingterms + "','"
						+ results.podetails[i].shipto + "','"
						+ order_status + "','"
						+ total + "','" 
						+ taxtotal + "','"
						+ id + "','"
			    			+ results.podetails[i].shippingorigin + "')" ;
			console.log("Query before insertion in Purchase Order ::" + insert_query );
			var fields_Insert_PO= {query:insert_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			 
			//client.query("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
			//db.run("insert into purchase_order('po_ns_id','tran_date','currency','memo','ex_factory_date','wh_arrival_date','delivery_method','ship_to','order_status','po_number','total','shipping_terms')values('"+results.podetails[i].tranID+"','"+results.podetails[i].tranDate+"','"+results.podetails[i].currency+"','"+results.podetails[i].memo+"','"+results.podetails[i].exfact+"','"+results.podetails[i].wharrival+"','"+results.podetails[i].delmethod+"','"+results.podetails[i].shipto+"','"+order_status+"','"+results.podetails[i].poNumber+"','"+results.podetails[i].total+"','"+results.podetails[i].shippoint+"')");
		}
		else
		{
						
			var update_query = "update purchase_order set po_ns_id='" + results.podetails[i].tranID
						+ "',tran_date='" + results.podetails[i].tranDate
						+ "',currency='" + results.podetails[i].currency
						+ "',memo='" + results.podetails[i].memo
						+ "',ex_factory_date=" + exfact
						+ ",wh_arrival_date=" + wharrival
						+ ",delivery_method='" + results.podetails[i].delmethod
						+ "',ship_to='" + results.podetails[i].shipto
						+ "',order_status='" + order_status
						+ "',po_number='" + results.podetails[i].poNumber
						+ "',total='" + total
						+ "',shipping_point='" + results.podetails[i].shippoint
						+ "',SHIPPING_TERMS='" + results.podetails[i].shippingterms
						+ "',tax_total='" + taxtotal
						+ "',shipment_origin='" + results.podetails[i].shippingorigin
						+ "' where po_ns_id= '" + results.podetails[i].tranID
						+ "' AND vendor_ns_id::integer= '" + id
						+ "'"; 
			console.log("Query before updation in Purchase Order ::" + update_query );
			var fields_Insert_PO= {query:update_query};
			dbs.query('purchase_order',fields_Insert_PO);
			dbs.update();
			//db.run("update purchase_order set po_ns_id='"+results.podetails[i].tranID+"',tran_date='"+results.podetails[i].tranDate+"',currency='"+results.podetails[i].currency+"',memo='"+results.podetails[i].memo+"',ex_factory_date='"+results.podetails[i].exfact+"',wh_arrival_date='"+results.podetails[i].wharrival+"',delivery_method='"+results.podetails[i].delmethod+"',ship_to='"+results.podetails[i].shipto+"',order_status='"+order_status+"',po_number='"+results.podetails[i].poNumber+"',total='"+results.podetails[i].total+"',SHIPPING_TERMS='"+results.podetails[i].shippoint+"' where po_ns_id= '"+results.podetails[i].tranID+"'"); 
		
		}
		 
		 
				 for(var j=0;j<results.podetails[i].itempush.length;j++)
			{
				console.log('in j loop::'+[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(po_line_list,[results.podetails[i].tranID,results.podetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.podetails[i].itempush[j].taxamount=='')
				{
					var taxamount = 0;
					console.log("If tax amount is null :: " + taxamount );
				}
				else
				{
					var taxamount  = results.podetails[i].itempush[j].taxamount;
					console.log("TAx Amont not null :: " + taxamount);
				}
				if(results.podetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;
					console.log("If item Qty is null :: " + itemQty );
				}
				else
				{
					var itemQty  = results.podetails[i].itempush[j].itemQty;
					console.log("item Qty not null :: " + itemQty);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice<0)
				{
					var amount = results.podetails[i].itempush[j].amount*(-1);
					console.log("If amount  is negative :: " + amount );
				}
				else
				{
					var amount  = results.podetails[i].itempush[j].amount;
					console.log("amount not negative :: " + amount);
				}
				if(results.podetails[i].itempush[j].itemUnitPrice=='')
				{
					var itemUnitPrice = 0;
					console.log("If itemUnitPrice  is null :: " + itemUnitPrice );
				}
				else
				{
					var itemUnitPrice  = results.podetails[i].itempush[j].itemUnitPrice;
					console.log("itemUnitPrice not null :: " + itemUnitPrice);
				}
				if(!is_exist)
				{
					var insert_query = "insert into po_lines values('"
								+ results.podetails[i].itempush[j].itemID + "','"
								+ results.podetails[i].itempush[j].itemName + "','"
								+ results.podetails[i].tranID + "','"
								+ results.podetails[i].itempush[j].itemDescription + "','"
								+ itemQty + "','"
								+ itemUnitPrice + "','"
								+ amount + "','"
								+ results.podetails[i].itempush[j].taxrate + "','"
								+ taxamount + "','"
								+ id + "','"
								+ results.podetails[i].itempush[j].vendorname + "')";
					//db.run("insert into po_lines('po_ns_id','item_id','qty','rate','amount','item_name','description') values('"+results.podetails[i].tranID+"','"+results.podetails[i].itempush[j].itemID+"','"+results.podetails[i].itempush[j].itemQty+"','"+results.podetails[i].itempush[j].itemUnitPrice+"','"+results.podetails[i].itempush[j].amount+"','"+results.podetails[i].itempush[j].itemName+"','"+results.podetails[i].itempush[j].itemName+"')"); 
					console.log("Query before insertion in Purchase Order Lines ::" + insert_query );
					var fields_Insert_PO= {query:insert_query};
					dbs.query('po_lines',fields_Insert_PO);
					dbs.update();
					
				}
				else
				{			
					var update_query = "update po_lines set po_ns_id='" + results.podetails[i].tranID
								+ "',item_id='" + results.podetails[i].itempush[j].itemID 
								+ "',qty='" + itemQty
								+ "',rate='" + itemUnitPrice
								+ "',amount='" + amount
								+ "',item_name='" + results.podetails[i].itempush[j].itemName
								+ "',description='"+results.podetails[i].itempush[j].itemDescription
								+ "',tax_code='" + results.podetails[i].itempush[j].taxrate
								+ "',tax_amount='" + taxamount
								+ "',supplier_reference='" + results.podetails[i].itempush[j].vendorname
								+ "' where po_ns_id= '" + results.podetails[i].tranID
								+ "' AND item_id='" + results.podetails[i].itempush[j].itemID
								+ "' AND vendor_ns_id::integer='" + id
								+ "'"; 
					console.log("Query before updation in Purchase Order Lines ::" + update_query );
					//db.run("update po_lines set po_ns_id='"+results.podetails[i].tranID+"',item_id='"+results.podetails[i].itempush[j].itemID+"',qty='"+results.podetails[i].itempush[j].itemQty+"',rate='"+results.podetails[i].itempush[j].itemUnitPrice+"',amount='"+results.podetails[i].itempush[j].amount+"',item_name='"+results.podetails[i].itempush[j].itemName+"',description='"+results.podetails[i].itempush[j].itemName+"' where po_ns_id= '"+results.podetails[i].tranID+"' AND item_id='"+results.podetails[i].itempush[j].itemID+"'"); 
					var fields_update_PO= {query:update_query};
					dbs.query('po_lines',fields_update_PO);
					dbs.update();
				}
			} 
		}
	});
	});	
	
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}

var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
	
		var update_query = "update timestamp set timestamp='"+results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+ " AND vendor_ns_id::integer='"+ id
					+ "'";
		var fields_update_timestamp= {query:update_query};
		dbs.query('timestamp',fields_update_timestamp);
		dbs.update();
			
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	 */
	 
 
}	
		

});
	
if(postatus!='none')
{
	setTimeout(function () {
           res.redirect(303,'/postatusview?po_status='+postatus+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
	
}
else
{
	setTimeout(function () {
           res.redirect(303,'/poview?po_ns_id='+poid+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
	
}
	}
}
else
{
	res.render('signout',{});
}

});

//*************************************************************************************************

/*GET refresh page for bills. */
app.get('/refreshbills', requireLogin, function(req, res, next) {
	
if(id)
{
		console.log("Bills Refresh page ");
	
	//RecordType.rec_type=req.query.record_type;
	var rec_type='Bills';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	var billstatus=req.query.bill_status;
		console.log("billstatus  "+billstatus);
	var rest_params = null;
	if(billstatus=='none')	
	{
		
		var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		console.log('Before timestamp details :: ');
		dbs.query('timestamp',fields_timestamp_details);
		dbs.readData(function (result)
			{
				if(result.length!=0)
				{
					var time_stamp = result[0].timestamp;
					console.log("time_stamp  "+time_stamp);
				}
				else
				{
					var now = new Date();
	
					var hours=now.getHours();
					
					if(now.getHours()>12)
					{
						hours=parseInt(now.getHours())-12;
					}
					function AddZero(num) 
					{
					    return (num >= 0 && num < 10) ? "0" + num : num + "";
					}
					var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
					console.log("New Time Stamp :: " + strDateTime);
					var time_stamp = strDateTime ;
				}
				rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
				function onFailure(err) {
  				process.stderr.write("Refresh Failed: " + err.message + "\n");
  				//process.exit(1);
				}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

				search.run(rest_params, function (err, results) 
				{
				  if (err) onFailure(err);
				 
				 if(results.status=='Successful')
				 {
					 
				
				// create an arry of existing POs	
					
					
				 
				   console.log('results:::'+results);
				  var parsed_response=JSON.stringify(results);
					console.log('parsed_response:::'+parsed_response);
				  var header=results.status;
				  	
				
				   
				  var data_len=results.billdetails.length;
				  console.log('data_len:::'+data_len);
						
					console.log('status::'+header);
					console.log('datalength::'+data_len);
					console.log('itemdatalength::'+results.billdetails[0].itempush.length);
					console.log("tranID : "+results.billdetails[0].tranID);
					console.log("item_id : "+results.billdetails[0].itempush[0].itemID);
					console.log("timestamp : "+results.updatetimestamp);
				
					
					function isItemInArray(array, item) {
				    for (var i = 0; i < array.length; i++) {
				        // This if statement depends on the format of your array
				        if (array[i][0] == item[0] && array[i][1] == item[1]) {
				            return true;   // Found it
				        }
				    }
				    return false;   // Not found
				}
					//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
					/*contents.on("end", function (result) {          
					console.log('Purchase Order View');
					client.end();
						
					});
					*/
					//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");
				
					var fields_bill_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
					dbs.query('BILL_LIST',fields_bill_list_details);
					var bill_list=new Array(); 
					dbs.readData(function (result){
						
					
						if(result!=null)
						{
							for(var r=0;r<result.length; r++) 
								{
									bill_list[r]=result[r].bill_list_ns_id;
								}
					
							console.log('bill_list array::'+bill_list);
						}
					
					
				
				// create a arry of existing POs	
					//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
					
					var fields_bill_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
					dbs.query('bill_list_lines',fields_bill_list_lines_details);
					var bill_line_list=new Array();
					dbs.readData(function (result1){
				
						 
					
						if(result1!=null)
						{
					
							for(var r=0;r<result1.length; r++) 
							{
								bill_line_list[r]=new Array();
								bill_line_list[r][0]=result1[r].bill_list_ns_id;
								bill_line_list[r][1]=result1[r].item_id;
				
							}
									console.log('bill_line_list array::'+bill_line_list);
						}
					
						
				// insert or update Bill List and Bill List lines
					 for(var i=0;i<results.billdetails.length;i++)
					{
						console.log('in i loop::');
						
						console.log('Bill List :: ' + bill_list);
						var index=bill_list.indexOf(parseInt(results.billdetails[i].tranID));
						console.log('index::'+index);
						
						
						
						if(index<0)
						{
							var insert_query = "insert into bill_list values('"
										+ results.billdetails[i].tranID + "','"
										+ results.billdetails[i].total + "','"
										+ results.billdetails[i].tranDate + "','"
										+ results.billdetails[i].memo + "','"
										+ results.billdetails[i].approvalstatus + "','"
										+ results.billdetails[i].poNumber + "','"
										+ id + "','"
										+ results.billdetails[i].po_ns_id + "')";
							var fields_insert_details = {query:insert_query};
							dbs.query(null,fields_insert_details);
							dbs.update();
							//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
						}
						else
						{
							var update_query= "update bill_list set BILL_LIST_NS_ID='" + results.billdetails[i].tranID
										+ "',BILL_DATE='" + results.billdetails[i].tranDate
										+ "',po_id='" + results.billdetails[i].poNumber
										+ "',po_ns_id='" + results.billdetails[i].po_ns_id
										+ "',AMOUNT='" + results.billdetails[i].total
										+ "',memo='" + results.billdetails[i].memo
										+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
										+ "' AND vendor_ns_id='" + id + "'";
							var fields_update_details = {query:update_query};
							dbs.query(null,fields_update_details);
							dbs.update();
							//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
						
						}
						 
						 
							for(var j=0;j<results.billdetails[i].itempush.length;j++)
							{
								var neg_factor_qty=1;
								if(results.billdetails[i].itempush[j].itemQty<1)
								{
									neg_factor_qty=-1;
									var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
								}
								else if(results.billdetails[i].itempush[j].itemQty=='')
								{
									var itemQty = 0;	
								}
								else
								{
									var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
								}
								var neg_factor_amt=1;
								if((results.billdetails[i].itempush[j].amount<1)||(results.billdetails[i].itempush[j].itemQty==''))
								{
									neg_factor_amt=-1;
									var amount = results.billdetails[i].itempush[j].amount*neg_factor_amt;
								}
								else 
								{
									var amount = results.billdetails[i].itempush[j].amount ; 
								}
							
					
								console.log('in j loop::'+[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
								
								var is_exist=isItemInArray(bill_line_list,[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
								
								console.log('is_exist::'+is_exist);
								
								console.log("Before display ::" + results.billdetails[i].itempush[j].taxamount);
								if(results.billdetails[i].itempush[j].taxamount!="")
								{
									var tax_amount = parseInt(results.billdetails[i].itempush[j].taxamount);
									console.log("Tax amount if tax is not null :: " + tax_amount);
								}
								else
								{
									var tax_amount = 0;
									console.log("Tax amount if Tax is null :: " + tax_amount);
								}
								if(results.billdetails[i].itempush[j].grosswt!=null)
								{
									var gross_wt = parseInt(results.billdetails[i].itempush[j].grosswt);
									console.log("Gross Wt if not null :: " + gross_wt);
								}
								else
								{
									var gross_wt = 0;
									console.log("Gross Wt if null :: " + gross_wt);
								}
								if(results.billdetails[i].po_ns_id==null)
								{
									var po_ns_id = 0;
									console.log("PO NS ID if null :: " + po_ns_id);
								}
								else 
								{
									po_ns_id = results.billdetails[i].po_ns_id;
								}
								var total_amount = parseInt(results.billdetails[i].itempush[j].amount*neg_factor_amt) + tax_amount ; 
								console.log("Total amount calculated :: " + total_amount);
								
								if(!is_exist)
								{
										
										
										var insert_query = "insert into bill_list_lines values('"
													+ results.billdetails[i].tranID + "','"
													+ results.billdetails[i].itempush[j].itemID + "','"
													+ results.billdetails[i].itempush[j].itemName + "','"
													+ results.billdetails[i].itempush[j].itemDes + "','"
													+ itemQty + "','"
													+ amount + "','"
													+ tax_amount + "','"
													+ total_amount + "','"
													+ gross_wt + "','"
													+ po_ns_id + "','"
													+ id + "')";
										console.log("Inserting into Bill List Lines when status is none :: " + insert_query);
										var fields_bll_insert_details = {query:insert_query};
										dbs.query(null,fields_bll_insert_details);
										dbs.update();
										//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
								}
								else
								{
									var update_query = "update bill_list_lines set BILL_LIST_NS_ID='"+results.billdetails[i].tranID
												+ "',ITEM_ID='" + results.billdetails[i].itempush[j].itemID
												+ "',QUANTITY='" + itemQty
												+ "',ITEM_NAME='" + results.billdetails[i].itempush[j].itemName
												+ "',DESCRIPTION='" + results.billdetails[i].itempush[j].itemDes
												+ "',amount='" + amount
												+ "',po_ns_id='" + po_ns_id
												+ "',tax_amount='" + tax_amount
												+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
												+ "' AND item_id='" + results.billdetails[i].itempush[j].itemID
												+ "' AND vendor_ns_id='" + id + "'"; 
									var fields_bll_update_details = {query:update_query};
									dbs.query(null,fields_bll_update_details);
									dbs.update();
									 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
								}
							} 
						}
					});
					});
						var date_obj=new Date();
					Number.prototype.padLeft = function(base,chr){
				    var  len = (String(base || 10).length - String(this).length)+1;
				    return len > 0? new Array(len).join(chr || '0')+this : this;
				}
					
						var date_obj = new Date,
				    current_date = [(date_obj.getMonth()+1).padLeft(),
				               date_obj.getDate().padLeft(),
				               date_obj.getFullYear()].join('/') +' ' +
				              [date_obj.getHours().padLeft(),
				               date_obj.getMinutes().padLeft(),
				               date_obj.getSeconds().padLeft()].join(':');
				
						var update_query = "update timestamp set timestamp='" + results.updatetimestamp
									+ "',local_time='" + current_date
									+ "' where rec_type=" + rec_type
									+" AND vendor_ns_id::integer='" + id +"'";
						var fields_bll_timestamp_update = {query:update_query};
						dbs.query(null,fields_bll_timestamp_update);
						dbs.update();
						//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
						//client.end();
					/*var data = db.export();
					var buffer = new Buffer(data);
						console.log('fs::'+fs);
					fs.writeFileSync("supplier_master.db", buffer);
					*/
					}
					});
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

			});
		
	}
	else
	{
		var billid=req.query.bill_id;
		console.log("billid  "+billid);
		
		var rest_params = {"vendor_id":id,"event":"refresh","bill_id_ns":billid};
	
	

			
	
function onFailure(err) {
  process.stderr.write("Refresh Failed: " + err.message + "\n");
 // process.exit(1);
}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 if(results.status=='Successful')
 {
	 
 
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
  var header=results.status;
  	

   
  var data_len=results.billdetails.length;
  console.log('data_len:::'+data_len);
		
	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.billdetails[0].itempush.length);
	console.log("tranID : "+results.billdetails[0].tranID);
	console.log("item_id : "+results.billdetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);

	
// create an arry of existing POs	
	
	var fields_bill_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_list',fields_bill_list_details);
	var bill_list=new Array(); 
	dbs.readData(function (result2){
		
	
		if(result2!=null)
		{
			for(var r=0;r<result2.length; r++) 
				{
					bill_list[r]=result2[r].bill_list_ns_id;
				}
	
			console.log('bill_list array::'+bill_list);
		}
	
	
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");



// create a arry of existing POs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('BILL_LIST_LINES',fields_bill_list_lines_details);
	var bill_line_list=new Array();
	dbs.readData(function (result){

		 
	
		if(result!=null)
		{
	
			for(var r=0;r<result.length; r++) 
			{
				bill_line_list[r]=new Array();
				bill_line_list[r][0]=result[r].bill_list_ns_id;
				bill_line_list[r][1]=result[r].item_id;

			}
					console.log('bill_line_list array::'+bill_line_list);
		}
	
	
	function isItemInArray(array, item) {
    for (var i = 0; i < array.length; i++) {
        // This if statement depends on the format of your array
        if (array[i][0] == item[0] && array[i][1] == item[1]) {
            return true;   // Found it
        }
    }
    return false;   // Not found
}
	
		
// insert or update PO and PO lines
	 for(var i=0;i<results.billdetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=bill_list.indexOf(parseInt(results.billdetails[i].tranID));
		console.log('index::'+index);
		
		
		
		if(index<0)
		{
			
			var insert_query = "insert into bill_list values('"
								+ results.billdetails[i].tranID + "','"
								+ results.billdetails[i].total + "','"
								+ results.billdetails[i].tranDate + "','"
								+ results.billdetails[i].memo + "','"
								+ results.billdetails[i].approvalstatus + "','"
								+ results.billdetails[i].poNumber + "','"
								+ id + "','"
								+ results.billdetails[i].po_ns_id+ "')";
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_list set BILL_LIST_NS_ID='" + results.billdetails[i].tranID
									+ "',BILL_DATE='" + results.billdetails[i].tranDate
									+ "',po_id='" + results.billdetails[i].poNumber
									+ "',po_ns_id='" + results.billdetails[i].po_ns_id
									+ "',AMOUNT='" + results.billdetails[i].total
									+ "',memo='" + results.billdetails[i].memo
									+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
									+ "' AND vendor_ns_id='" + id + "'";
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billdetails[i].itempush.length;j++)
			{
				
				
				
				var neg_factor_qty=1;
				if(results.billdetails[i].itempush[j].itemQty<1)
				{
					neg_factor_qty=-1;
					var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
				}
				else if(results.billdetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;	
				}
				else
				{
					var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
				}
				var neg_factor_amt=1;
				if((results.billdetails[i].itempush[j].amount<1)||(results.billdetails[i].itempush[j].itemQty==''))
				{
					neg_factor_amt=-1;
					var amount = results.billdetails[i].itempush[j].amount*neg_factor_amt;
				}
				else 
				{
					var amount = results.billdetails[i].itempush[j].amount ; 
				}
	
				console.log('in j loop::'+[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(bill_line_list,[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.billdetails[i].itempush[j].taxamount!="")
						{
								var tax_amount = parseFloat(results.billdetails[i].itempush[j].taxamount);
						}
						else
						{
							var tax_amount = 0;
						}
						if(results.billdetails[i].itempush[j].grosswt!=null)
						{
							var gross_wt = parseFloat(results.billdetails[i].itempush[j].grosswt);
							console.log("Gross Wt if not null :: " + gross_wt);
						}
						else
						{
							var gross_wt = 0;
							console.log("Gross Wt if null :: " + gross_wt);
						}
						if(results.billdetails[i].itempush[j].poNumber!=null)
						{
							var po_ns_id = parseInt(results.billdetails[i].po_ns_id);
							console.log("PO NS ID if not null :: " + po_ns_id);
						}
						else
						{
							var po_ns_id = 0;
							console.log("PO NS ID if null :: " + po_ns_id);
						}
						var total_amount = parseFloat(results.billdetails[i].itempush[j].amount*neg_factor_amt) + tax_amount ;		
				if(!is_exist)
				{
						 
						var insert_query = "insert into bill_list_lines values('"
													+ results.billdetails[i].tranID + "','"
													+ results.billdetails[i].itempush[j].itemID + "','"
													+ results.billdetails[i].itempush[j].itemName + "','"
													+ results.billdetails[i].itempush[j].itemDes + "','"
													+ itemQty + "','"
													+ amount + "','"
													+ tax_amount + "','"
													+ total_amount + "','"
													+ gross_wt + "','"
													+ po_ns_id + "','"
													+ id + "')";
						console.log("Inserting into Bill List Lines when status is none :: " + insert_query);
						var fields_bll_insert_details = {query:insert_query};
						dbs.query(null,fields_bll_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_list_lines set BILL_LIST_NS_ID='"+results.billdetails[i].tranID
												+ "',ITEM_ID='" + results.billdetails[i].itempush[j].itemID
												+ "',QUANTITY='" + itemQty
												+ "',ITEM_NAME='" + results.billdetails[i].itempush[j].itemName
												+ "',DESCRIPTION='" + results.billdetails[i].itempush[j].itemDes
												+ "',amount='" + amount
												+ "',po_ns_id='" + po_ns_id
												+ "',tax_amount='" + tax_amount
												+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
												+ "' AND item_id='" + results.billdetails[i].itempush[j].itemID
												+ "' AND vendor_ns_id='" + id + "'"; 
					var fields_bll_update_details = {query:update_query};
					dbs.query(null,fields_bll_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
	
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
	}	
if(billstatus=='none')
{
	setTimeout(function () {
           res.redirect(303,'/billlistview?&notdata[]='+notdata+'&count='+count);
        }, 5000);

	
}
else
{
	setTimeout(function () {
           res.redirect(303,'/billview?bill_ns_id='+billid+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
}
}
else
{
	res.render('signout',{});
}
	

});

/* GET Bill List Pages. */
app.get('/billlistview', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("Bill View page ");
	//var id=req.query.vendorid;  
	
	var rec_type='Bills';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	

		
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result)
		{
			if(result.length!=0)
			{
				var time_stamp = result[0].timestamp;
				console.log("time_stamp  "+time_stamp);
			}
			else
			{
				
				var now = new Date();

				var hours=now.getHours();
				
				if(now.getHours()>12)
				{
					hours=parseInt(now.getHours())-12;
				}
				function AddZero(num) 
				{
				    return (num >= 0 && num < 10) ? "0" + num : num + "";
				}
				var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
				console.log("New Time Stamp :: " + strDateTime);
				var time_stamp = strDateTime ;
			}
			rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
			function onFailure(err) {
  			process.stderr.write("Refresh Failed: " + err.message + "\n");
  			//process.exit(1);
			}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet


			search.run(rest_params, function (err, results) 
			{
			  if (err) onFailure(err);
			 
			 if(results.status=='Successful')
			 {
				// create an arry of existing POs	
			   	console.log('results:::'+results);
			  	var parsed_response=JSON.stringify(results);
				console.log('parsed_response:::'+parsed_response);
			  	var header=results.status;
			  	
			
			   
				 var data_len=results.billdetails.length;
				 count  = data_len ; 
				 var newnotf = data_len + " bill added /created";
			  	console.log('data_len:::'+data_len);
				notdata.push(newnotf);	
				console.log('status::'+header);
				console.log('datalength::'+data_len);
				console.log('itemdatalength::'+results.billdetails[0].itempush.length);
				console.log("tranID : "+results.billdetails[0].tranID);
				console.log("item_id : "+results.billdetails[0].itempush[0].itemID);
				console.log("timestamp : "+results.updatetimestamp);
			
				
				function isItemInArray(array, item) {
			    for (var i = 0; i < array.length; i++) {
			        // This if statement depends on the format of your array
			        if (array[i][0] == item[0] && array[i][1] == item[1]) {
			            return true;   // Found it
			        }
			    }
			    return false;   // Not found
			}
				//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
				/*contents.on("end", function (result) {          
				console.log('Purchase Order View');
				client.end();
					
				});
				*/
				//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");
			
				var fields_bill_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
				dbs.query('BILL_LIST',fields_bill_list_details);
				var bill_list=new Array(); 
				dbs.readData(function (result){
					
				
					if(result!=null)
					{
						for(var r=0;r<result.length; r++) 
							{
								bill_list[r]=result[r].bill_list_ns_id;
							}
				
						console.log('bill_list array::'+bill_list);
					}
				
				
			
			// create a arry of existing POs	
				//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
				
				var fields_bill_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
				dbs.query('bill_list_lines',fields_bill_list_lines_details);
				var bill_line_list=new Array();
				dbs.readData(function (result1){
			
					 
				
					if(result1!=null)
					{
				
						for(var r=0;r<result1.length; r++) 
						{
							bill_line_list[r]=new Array();
							bill_line_list[r][0]=result1[r].bill_list_ns_id;
							bill_line_list[r][1]=result1[r].item_id;
			
						}
								console.log('bill_line_list array::'+bill_line_list);
					}
				
					
			// insert or update Bill List and Bill List lines
				 for(var i=0;i<results.billdetails.length;i++)
				{
					console.log('in i loop::');
					
					console.log('Bill List :: ' + bill_list);
					var index=bill_list.indexOf(parseInt(results.billdetails[i].tranID));
					console.log('index::'+index);
					
					
					
					if(index<0)
					{
						var insert_query = "insert into bill_list values('"
									+ results.billdetails[i].tranID + "','"
									+ results.billdetails[i].total + "','"
									+ results.billdetails[i].tranDate + "','"
									+ results.billdetails[i].memo + "','"
									+ results.billdetails[i].approvalstatus + "','"
									+ results.billdetails[i].poNumber + "','"
									+ id + "','"
									+ results.billdetails[i].po_ns_id + "')";
						var fields_insert_details = {query:insert_query};
						dbs.query(null,fields_insert_details);
						dbs.update();
						//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
					}
					else
					{
						var update_query= "update bill_list set BILL_LIST_NS_ID='" + results.billdetails[i].tranID
									+ "',BILL_DATE='" + results.billdetails[i].tranDate
									+ "',po_id='" + results.billdetails[i].poNumber
									+ "',po_ns_id='" + results.billdetails[i].po_ns_id
									+ "',AMOUNT='" + results.billdetails[i].total
									+ "',memo='" + results.billdetails[i].memo
									+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
									+ "' AND vendor_ns_id='" + id + "'";
						var fields_update_details = {query:update_query};
						dbs.query(null,fields_update_details);
						dbs.update();
						//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
					
					}
					 
					 
						for(var j=0;j<results.billdetails[i].itempush.length;j++)
						{
							
							
							
							var neg_factor_qty=1;
							if(results.billdetails[i].itempush[j].itemQty<1)
							{
								neg_factor_qty=-1;
								var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
							}
							else if(results.billdetails[i].itempush[j].itemQty=='')
							{
								var itemQty = 0;	
							}
							else
							{
								var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
							}
							var neg_factor_amt=1;
							if((results.billdetails[i].itempush[j].amount<1)||(results.billdetails[i].itempush[j].itemQty==''))
							{
								neg_factor_amt=-1;
								var amount = results.billdetails[i].itempush[j].amount*neg_factor_amt;
							}
							else 
							{
								var amount = results.billdetails[i].itempush[j].amount ; 
							}
							
							console.log('in j loop::'+[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
							
							var is_exist=isItemInArray(bill_line_list,[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
							
							console.log('is_exist::'+is_exist);
							
							console.log("Before display ::" + results.billdetails[i].itempush[j].taxamount);
							if(results.billdetails[i].itempush[j].taxamount!="")
							{
								var tax_amount = parseFloat(results.billdetails[i].itempush[j].taxamount);
								console.log("Tax amount if tax is not null :: " + tax_amount);
							}
							else
							{
								var tax_amount = 0;
								console.log("Tax amount if Tax is null :: " + tax_amount);
							}
							if(results.billdetails[i].itempush[j].grosswt!=null)
							{
								var gross_wt = parseFloat(results.billdetails[i].itempush[j].grosswt);
								console.log("Gross Wt if not null :: " + gross_wt);
							}
							else
							{
								var gross_wt = 0;
								console.log("Gross Wt if null :: " + gross_wt);
							}
							if(results.billdetails[i].po_ns_id==null||results.billdetails[i].po_ns_id=='')
							{
								var po_ns_id = 0;
								console.log("PO NS ID if null :: " + po_ns_id);
							}
							else 
							{
								po_ns_id = results.billdetails[i].po_ns_id;
							}
							var total_amount = parseFloat(results.billdetails[i].itempush[j].amount*neg_factor_amt) + tax_amount ; 
							console.log("Total amount calculated :: " + total_amount);
							
							if(!is_exist)
							{
									
									
									var insert_query = "insert into bill_list_lines values('"
												+ results.billdetails[i].tranID + "','"
												+ results.billdetails[i].itempush[j].itemID + "','"
												+ results.billdetails[i].itempush[j].itemName + "','"
												+ results.billdetails[i].itempush[j].itemDes + "','"
												+ itemQty + "','"
												+ amount + "','"
												+ tax_amount + "','"
												+ total_amount + "','"
												+ gross_wt + "','"
												+ po_ns_id + "','"
												+ id + "')";
									console.log("Inserting into Bill List Lines when status is none :: " + insert_query);
									var fields_bll_insert_details = {query:insert_query};
									dbs.query(null,fields_bll_insert_details);
									dbs.update();
									//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
							}
							else
							{
								var update_query = "update bill_list_lines set BILL_LIST_NS_ID='"+results.billdetails[i].tranID
											+ "',ITEM_ID='" + results.billdetails[i].itempush[j].itemID
											+ "',QUANTITY='" + itemQty
											+ "',ITEM_NAME='" + results.billdetails[i].itempush[j].itemName
											+ "',DESCRIPTION='" + results.billdetails[i].itempush[j].itemDes
											+ "',amount='" + amount
											+ "',po_ns_id='" + po_ns_id
											+ "',tax_amount='" + tax_amount
											+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
											+ "' AND item_id='" + results.billdetails[i].itempush[j].itemID
											+ "' AND vendor_ns_id='" + id + "'"; 
								var fields_bll_update_details = {query:update_query};
								dbs.query(null,fields_bll_update_details);
								dbs.update();
								 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
							}
						} 
					}
				});
				});
					var date_obj=new Date();
				Number.prototype.padLeft = function(base,chr){
			    var  len = (String(base || 10).length - String(this).length)+1;
			    return len > 0? new Array(len).join(chr || '0')+this : this;
			}
				
					var date_obj = new Date,
			    current_date = [(date_obj.getMonth()+1).padLeft(),
			               date_obj.getDate().padLeft(),
			               date_obj.getFullYear()].join('/') +' ' +
			              [date_obj.getHours().padLeft(),
			               date_obj.getMinutes().padLeft(),
			               date_obj.getSeconds().padLeft()].join(':');
			
					var update_query = "update timestamp set timestamp='" + results.updatetimestamp
								+ "',local_time='" + current_date
								+ "' where rec_type=" + rec_type
								+" AND vendor_ns_id::integer='" + id +"'";
					var fields_bll_timestamp_update = {query:update_query};
					dbs.query(null,fields_bll_timestamp_update);
					dbs.update();
					//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
					//client.end();
				/*var data = db.export();
				var buffer = new Buffer(data);
					console.log('fs::'+fs);
				fs.writeFileSync("supplier_master.db", buffer);
				*/
				}
				});
	//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

		});
	
		
	
	
	var page_title='Vendor Bill';
	var bill_id=new Array();
	var date_create=new Array();
	var amount=new Array();
	var poid = new Array();
	var memo = new Array();
	var date = new Array();
	var time_stamp='';

//var timestamp_contents = db.exec("select timestamp from timestamp where rec_type= 'Bills'");
//var timestamp_contents = db.exec("select localtime from timestamp where rec_type= 'Bills'");
setTimeout(function(){
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:"'Bills'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result){
		if(result.length!=0)
		{
			console.log("result timestamp details :: "+ JSON.stringify(result));
			time_stamp = result[0].timestamp;
			console.log("time_stamp :: "+time_stamp);
		}
		else {
			
				var vndr={key:"VENDOR_NS_ID::integer",operator:"=",value:id};
				dbs.query('vendor_master',vndr);
				
				dbs.readData(function (results){
				var dat = dt.timestamp_formatter(results[0].date_created);
				setTimeout(function () {
				var timestamp_bl = "INSERT INTO timestamp VALUES('Bills','"
						+ dat + "','"
						+ dat + "','"
						+ results[0].vendor_ns_id + "')" ;
			
				console.log("Insert Query Timestamp PO ::" + timestamp_bl);
				var fields_timestamp_bl_create = {query:timestamp_bl};
				dbs.query(null,fields_timestamp_bl_create);
				dbs.update();
				},5000);
				time_stamp = dt.timestamp_formatter(results[0].date_created);
				console.log("current time_stamp check :: ");
				});
			
			
			//time_stamp = Date.now();
		}
	var fields_bill_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_list',fields_bill_list_details);
	dbs.readData(function (result){
	console.log("result bill list :: "+ JSON.stringify(result));
	
	if(result != null)
	{
		console.log("contents length : " + result.length);
		
		for (var i=0; i<result.length; i++) 
		{
			bill_id[i] = result[i].bill_list_ns_id; 
			date_create[i] = result[i].bill_date;
			amount[i] = result[i].amount;
			memo[i] = result[i].memo;
			date_create[i] = dt.timestamp_formatter(result[i].bill_date);
			console.log("bill_id "+bill_id);
			console.log("date_create "+date_create);
			console.log("amount "+amount);
			console.log("memo "+memo);
			

			console.log("*****************************");
		}
	
  res.render('billlistview', { //render the index.ejs
	 
	  tran_id:bill_id,
	  tran_date:date_create,
	  tran_amount:amount,
	  tran_memo:memo,
	  title:page_title,
	  vendorname:vendor_name,
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  time_stamp_val:time_stamp,
	  contentlength:result.length
	  
  });
	}
	else
	{
		res.render('billlistview',{
			 contentlength:0,
			 title:page_title,
			 vendorname:vendor_name,
			 time_stamp_val:time_stamp,
			 notdata_rend:notdata,
	   		 count_rend:count,
			 v_id:id
		});
	}
		});
	});
},3000);
}
else
{
	res.render('signout',{});
}

	
});

/* GET billview page*/
app.get('/billview', requireLogin, function(req, res, next) {

if(id)
{
	console.log("Bill View page ");
	var rec_type='Bills';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	
	
	var billid=req.query.bill_ns_id;
	console.log("billid  "+billid);
		
	var rest_params = {"vendor_id":id,"event":"refresh","bill_id_ns":billid};
	
	function onFailure(err) {
	process.stderr.write("Refresh Failed: " + err.message + "\n");
	//process.exit(1);
	}
	
	// This will try the cached version first, if not there will run and then cache
	// trigger the restlet
	
	
	search.run(rest_params, function (err, results) {
	if (err) onFailure(err);
	
	if(results.status=='Successful')
	{
	 
	
	console.log('results:::'+results);
	var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
	var header=results.status;
	  
	
	
	var data_len=results.billdetails.length;
	console.log('data_len:::'+data_len);
		
	console.log('status::'+header);
	console.log('datalength::'+data_len);
	console.log('itemdatalength::'+results.billdetails[0].itempush.length);
	console.log("tranID : "+results.billdetails[0].tranID);
	console.log("item_id : "+results.billdetails[0].itempush[0].itemID);
	console.log("timestamp : "+results.updatetimestamp);
	
	
	// create an arry of existing POs	
	
	var fields_bill_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_list',fields_bill_list_details);
	var bill_list=new Array(); 
	dbs.readData(function (result2){
		
	
		if(result2!=null)
		{
			for(var r=0;r<result2.length; r++) 
				{
					bill_list[r]=result2[r].bill_list_ns_id;
				}
	
			console.log('bill_list array::'+bill_list);
		}
	
	
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");
	
	
	
	// create a arry of existing POs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('BILL_LIST_LINES',fields_bill_list_lines_details);
	var bill_line_list=new Array();
	dbs.readData(function (result){
	
		 
	
		if(result!=null)
		{
	
			for(var r=0;r<result.length; r++) 
			{
				bill_line_list[r]=new Array();
				bill_line_list[r][0]=result[r].bill_list_ns_id;
				bill_line_list[r][1]=result[r].item_id;
	
			}
					console.log('bill_line_list array::'+bill_line_list);
		}
	
	
	function isItemInArray(array, item) {
	for (var i = 0; i < array.length; i++) {
	// This if statement depends on the format of your array
	if (array[i][0] == item[0] && array[i][1] == item[1]) {
	    return true;   // Found it
	}
	}
	return false;   // Not found
	}
	
		
	// insert or update PO and PO lines
	 for(var i=0;i<results.billdetails.length;i++)
	{
		console.log('in i loop::');
		
		var index=bill_list.indexOf(parseInt(results.billdetails[i].tranID));
		console.log('index::'+index);
		
		
		
		if(index<0)
		{
			
			var insert_query = "insert into bill_list values('"
								+ results.billdetails[i].tranID + "','"
								+ results.billdetails[i].total + "','"
								+ results.billdetails[i].tranDate + "','"
								+ results.billdetails[i].memo + "','"
								+ results.billdetails[i].approvalstatus + "','"
								+ results.billdetails[i].poNumber + "','"
								+ id + "','"
								+ results.billdetails[i].po_ns_id+ "')";
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_list set BILL_LIST_NS_ID='" + results.billdetails[i].tranID
									+ "',BILL_DATE='" + results.billdetails[i].tranDate
									+ "',po_id='" + results.billdetails[i].poNumber
									+ "',po_ns_id='" + results.billdetails[i].po_ns_id
									+ "',AMOUNT='" + results.billdetails[i].total
									+ "',memo='" + results.billdetails[i].memo
									+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
									+ "' AND vendor_ns_id='" + id + "'";
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billdetails[i].itempush.length;j++)
			{
				
				
				
				var neg_factor_qty=1;
				if(results.billdetails[i].itempush[j].itemQty<1)
				{
					neg_factor_qty=-1;
					var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
				}
				else if(results.billdetails[i].itempush[j].itemQty=='')
				{
					var itemQty = 0;	
				}
				else
				{
					var itemQty = results.billdetails[i].itempush[j].itemQty*neg_factor_qty;
				}
				var neg_factor_amt=1;
				if((results.billdetails[i].itempush[j].amount<1)||(results.billdetails[i].itempush[j].itemQty==''))
				{
					neg_factor_amt=-1;
					var amount = results.billdetails[i].itempush[j].amount*neg_factor_amt;
				}
				else 
				{
					var amount = results.billdetails[i].itempush[j].amount ; 
				}
				
				console.log('in j loop::'+[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
				
				var is_exist=isItemInArray(bill_line_list,[results.billdetails[i].tranID,results.billdetails[i].itempush[j].itemID]);
				
				console.log('is_exist::'+is_exist);
				if(results.billdetails[i].itempush[j].taxamount!="")
				{
					var tax_amount = parseInt(results.billdetails[i].itempush[j].taxamount);
				}
				else
				{
					var tax_amount = 0;
				}
				if(results.billdetails[i].itempush[j].grosswt!=null)
				{
					var gross_wt = parseInt(results.billdetails[i].itempush[j].grosswt);
					console.log("Gross Wt if not null :: " + gross_wt);
				}
				else
				{
					var gross_wt = 0;
					console.log("Gross Wt if null :: " + gross_wt);
				}
				if(results.billdetails[i].itempush[j].poNumber!=null)
				{
					var po_ns_id = parseInt(results.billdetails[i].po_ns_id);
					console.log("PO NS ID if not null :: " + po_ns_id);
				}
				else
				{
					var po_ns_id = 0;
					console.log("PO NS ID if null :: " + po_ns_id);
				}
				var total_amount = parseFloat(results.billdetails[i].itempush[j].amount*neg_factor_amt) + tax_amount ;		
				if(!is_exist)
				{
						 
						var insert_query = "insert into bill_list_lines values('"
													+ results.billdetails[i].tranID + "','"
													+ results.billdetails[i].itempush[j].itemID + "','"
													+ results.billdetails[i].itempush[j].itemName + "','"
													+ results.billdetails[i].itempush[j].itemDes + "','"
													+ itemQty + "','"
													+ amount + "','"
													+ tax_amount + "','"
													+ total_amount + "','"
													+ gross_wt + "','"
													+ po_ns_id + "','"
													+ id + "')";
						console.log("Inserting into Bill List Lines when status is none :: " + insert_query);
						var fields_bll_insert_details = {query:insert_query};
						dbs.query(null,fields_bll_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_list_lines set BILL_LIST_NS_ID='"+results.billdetails[i].tranID
												+ "',ITEM_ID='" + results.billdetails[i].itempush[j].itemID
												+ "',QUANTITY='" + itemQty
												+ "',ITEM_NAME='" + results.billdetails[i].itempush[j].itemName
												+ "',DESCRIPTION='" + results.billdetails[i].itempush[j].itemDes
												+ "',amount='" + amount
												+ "',po_ns_id='" + po_ns_id
												+ "',tax_amount='" + tax_amount
												+ "' where BILL_LIST_NS_ID= '" + results.billdetails[i].tranID
												+ "' AND item_id='" + results.billdetails[i].itempush[j].itemID
												+ "' AND vendor_ns_id='" + id + "'"; 
					var fields_bll_update_details = {query:update_query};
					dbs.query(null,fields_bll_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		/*var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
	var  len = (String(base || 10).length - String(this).length)+1;
	return len > 0? new Array(len).join(chr || '0')+this : this;
	}
	
		var date_obj = new Date,
	current_date = [(date_obj.getMonth()+1).padLeft(),
	       date_obj.getDate().padLeft(),
	       date_obj.getFullYear()].join('/') +' ' +
	      [date_obj.getHours().padLeft(),
	       date_obj.getMinutes().padLeft(),
	       date_obj.getSeconds().padLeft()].join(':');
	
		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		*/
		
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
	
	var poid ; 
	bill_ns_id=req.query.bill_ns_id;
	console.log("bill_ns_id  "+bill_ns_id);

	//var contents = db.exec("select * from bill_list where BILL_LIST_NS_ID = "+bill_ns_id);
	setTimeout(function(){
	var fields_bill_list_ns_details= {key:"bill_list_ns_id",operator:"=",value:bill_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('bill_list',fields_bill_list_ns_details);
	dbs.readData(function (result){
		console.log("result billList_ns_details details :: "+ JSON.stringify(result));
		console.log("contents length : "+result.length);
		for (var i=0; i<result.length; i++) 
		{
		bill_ns_id_val = result[i].bill_list_ns_id;
		trandate_val = dt.date_formatter(result[i].bill_date); 
		memo_val = result[i].memo;
		total_val = result[i].amount;
		poid = result[i].po_id;
		} 
		
	//var bill_line_contents = db.exec("select * from BILL_LIST_LINES where BILL_LIST_NS_ID = "+bill_ns_id);
	
	var fields_bill_list_line_contents= {key:"BILL_LIST_NS_ID",operator:"=",value:bill_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('bill_list_lines',fields_bill_list_line_contents);
	dbs.readData(function (result1){
		console.log("result billList_ns_details details :: "+ JSON.stringify(result1));
		console.log("contents length : "+result1.length);
		
	
		if(result1!=null)
		{
			console.log("bill_line_contents length : "+result1.length);
			var items_data = new Array();
		
			for (var i=0; i<result1.length; i++) 
			{
			var item = new Object();
			
			item.item_id_val= result1[i].item_id;
			console.log("item.item_id_val  "+item.item_id_val);
			
			item.item_name_val = result1[i].item_name;
			var item_desc_val = result1[i].description;
			if(item_desc_val=='null')
			{
				item.item_desc_val = ' ';
			}
			else
			{
				item.item_desc_val = item_desc_val;
			}
			item.bill_ns_id_val = result1[i].bill_list_ns_id;
			item.quantity_val = result1[i].quantity;
			item.amount_val = result1[i].amount; 
			item.tax_amt_val = result1[i].tax_amount; 
			items_data.push(item);
			
			}  
		
		
		
		console.log("items_data "+items_data);
		console.log("items_data "+JSON.stringify(items_data));
		
		res.render('billview', { //render the index.ejs
	 
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  vendorname:vendor_name,
	  bill_internal_id:bill_ns_id,
	  trandate:trandate_val,
	  po_id:poid,
	  items:items_data,	
	  tran_amount:total_val,
	  tran_memo:memo_val,
	  line_length:result.length
		});
		}		
	else
	{
		res.render('billview', { //render the index.ejs
	 
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  vendorname:vendor_name,
	  bill_internal_id:bill_ns_id,
	  trandate:trandate_val,
	  line_length:0
	
	  
  });
	}
	});
	});
	},3000);
}
else
{
	res.render('signout',{});
}	// route for '/'

	
	
});

/*GET refresh page for Bill Payments. */
app.get('/refreshbillpayments', requireLogin, function(req, res, next) {
	
if(id)
{
		console.log("Bill Payments Refresh page ");
	
	//RecordType.rec_type=req.query.record_type;
	var rec_type='BillPayment';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	var bill_payment_status=req.query.bill_payment_status;
	console.log("bill payment status  "+bill_payment_status);
	var rest_params = null;
	if(bill_payment_status=='none')	
	{
		
		var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		console.log('Before timestamp details :: ');
		dbs.query('timestamp',fields_timestamp_details);
		dbs.readData(function (result)
			{
				if(result.length!=0)
				{
					var time_stamp = result[0].timestamp;
					console.log("time_stamp  "+time_stamp);
				}
				else
				{
					
					var now = new Date();
	
					var hours=now.getHours();
					
					if(now.getHours()>12)
					{
						hours=parseInt(now.getHours())-12;
					}
					function AddZero(num) 
					{
					    return (num >= 0 && num < 10) ? "0" + num : num + "";
					}
					var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
					console.log("New Time Stamp :: " + strDateTime);
					var time_stamp = strDateTime ;
				}
				rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
				function onFailure(err) {
  				process.stderr.write("Refresh Failed: " + err.message + "\n");
  				//process.exit(1);
					}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

				search.run(rest_params, function (err, results) {
				  if (err) onFailure(err);
 
				 if(results.status=='Successful')
				 {
				// create an arry of existing Item Receipts	
				
				console.log('results:::'+results);
				var parsed_response=JSON.stringify(results);
				console.log('parsed_response:::'+parsed_response);
				var header=results.status;
				  	
				
				   
				var data_len=results.billpaymentdetails.length;
				console.log('data_len:::'+data_len);
						
				console.log('status::'+header);
				console.log('datalength::'+data_len);
				console.log('itemdatalength::'+results.billpaymentdetails[0].itempush.length);
				console.log("transaction number : "+results.billpaymentdetails[0].Transaction_Number);
				console.log("bill Payment netsuite id : "+results.billpaymentdetails[0].ns_id);
				console.log("timestamp : "+results.updatetimestamp);
				
					
					function isItemInArray(array, item) {
				    		for (var i = 0; i < array.length; i++) {
					        // This if statement depends on the format of your array
					        if (array[i][0] == item[0] && array[i][1] == item[1]) {
					            return true;   // Found it
					        		}
					    		}
						    return false;   // Not found
						}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_bill_payment_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment',fields_bill_payment_list_details);
	var bill_payment_list=new Array(); 
	dbs.readData(function (result){
		
	
		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					bill_payment_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('bill_payment_list array::'+bill_payment_list);
	

// create a arry of existing BPs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_payment_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment_lines',fields_bill_payment_list_lines_details);
	var bill_payment_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				bill_payment_line_list[r]=new Array();
				bill_payment_line_list[r][0]=result1[r].bill_payment_id;
				bill_payment_line_list[r][1]=result1[r].bill_id;

			}
					console.log('bill_payment_line_list array::'+bill_payment_line_list);
		}
	
	

	
		
// insert or update BP  and BP lines
	 for(var i=0;i<results.billpaymentdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Bill Payment List :: ' + bill_payment_list);
		var index=bill_payment_list.indexOf(parseInt(results.billpaymentdetails[i].ns_id));
		console.log('index::'+index);
		
		var neg_factor_qty=1;
		if(results.billpaymentdetails[i].Amount<0)
		{
			neg_factor_qty=-1;
		}
	//	+ results.billpaymentdetails[i].bill_ns_id + "','"
		
		if(results.billpaymentdetails[i].ns_ext_id=='')
		{
			var ns_ext_id = 0;
			console.log("ns_ext_id if null :: " + ns_ext_id);
		}
		else 
		{
			var ns_ext_id = results.billpaymentdetails[i].ns_ext_id;
		}
		
		
		if(index<0)
		{
			var insert_query = "insert into bill_payment values('"
						+ results.billpaymentdetails[i].ns_id + "','"
						+ ns_ext_id + "','"
						+ results.billpaymentdetails[i].Transaction_Number + "','"
						+ results.billpaymentdetails[i].Payee + "','"
						+ results.billpaymentdetails[i].Amount*neg_factor_qty + "','"
						+ results.billpaymentdetails[i].date + "','"
						+ results.billpaymentdetails[i].Currency + "','"
						+ results.billpaymentdetails[i].Memo + "','"
						+ id + "')";
			console.log("Query for insert query in bill_payment :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_payment set ns_id='" + results.billpaymentdetails[i].ns_id
						+ "',ns_ext_id='" + ns_ext_id
						+ "',transaction_number='" + results.billpaymentdetails[i].Transaction_Number
						+ "',payee='" + results.billpaymentdetails[i].Payee
						+ "',amount='" + results.billpaymentdetails[i].Amount*neg_factor_qty
						+ "',created_date='" + results.billpaymentdetails[i].date
						+ "',currency='" + results.billpaymentdetails[i].Currency
						+ "',memo='" + results.billpaymentdetails[i].Memo
						+ "' where ns_id= '" + results.billpaymentdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for insert query in bill_payment :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billpaymentdetails[i].itempush.length;j++)
			{
				
				
				
				
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
				console.log('in j loop::'+[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				var is_exist=isItemInArray(bill_payment_line_list,[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				if(results.billpaymentdetails[i].itempush[j].payment==''||results.billpaymentdetails[i].itempush[j].payment==null)
				{
					var payment = 0;
					console.log("payment if null :: " + payment);
				}
				else 
				{
					var payment = results.billpaymentdetails[i].itempush[j].payment;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_avail==''||results.billpaymentdetails[i].itempush[j].disc_avail==null)
				{
					var disc_avail = 0;
					console.log("disc_avail if null :: " + disc_avail);
				}
				else 
				{
					var disc_avail = results.billpaymentdetails[i].itempush[j].disc_avail;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_taken==''||results.billpaymentdetails[i].itempush[j].disc_taken==null)
				{
					var disc_taken = 0;
					console.log("disc_taken if null :: " + disc_taken);
				}
				else 
				{
					var disc_taken = results.billpaymentdetails[i].itempush[j].disc_taken;
				}
				if(results.billpaymentdetails[i].itempush[j].orig_amt==''||results.billpaymentdetails[i].itempush[j].orig_amt==null)
				{
					var orig_amt = 0;
					console.log("orig_amt if null :: " + orig_amt);
				}
				else 
				{
					var orig_amt = results.billpaymentdetails[i].itempush[j].orig_amt;
				}
				if(results.billpaymentdetails[i].itempush[j].amt_due==''||results.billpaymentdetails[i].itempush[j].amt_due==null)
				{
					var amt_due = 0;
					console.log("amt_due if null :: " + amt_due);
				}
				else 
				{
					var amt_due = results.billpaymentdetails[i].itempush[j].amt_due;
				}
				
				if(results.billpaymentdetails[i].itempush[j].disc_date==''||results.billpaymentdetails[i].itempush[j].disc_date==null)
				{
					var disc_date = null;
					console.log("disc_date if null :: " + disc_date);
				}
				else 
				{
					var disc_date = "'" + results.billpaymentdetails[i].itempush[j].disc_date + "'" ;
				}
				console.log('is_exist::'+is_exist);
				
				if(!is_exist)
				{
						var insert_query = "insert into bill_payment_lines values('"
									+ results.billpaymentdetails[i].ns_id + "','"
									+ results.billpaymentdetails[i].itempush[j].type + "','"
									+ orig_amt + "','"
									+ amt_due + "','"
									+ results.billpaymentdetails[i].itempush[j].date_due + "','"
									+ payment + "',"
									+ disc_date + ",'"
									+ disc_avail + "','"
									+ disc_taken + "','"
									+ id + "','"
									+ results.billpaymentdetails[i].itempush[j].bill_ns_id + "')";
						console.log("Query for insert query in bill_payment_lines :: " + insert_query);
						var fields_bpl_insert_details = {query:insert_query};
						dbs.query(null,fields_bpl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_payment_lines set bill_payment_id='"+results.billpaymentdetails[i].ns_id
								+ "',type='" + results.billpaymentdetails[i].itempush[j].type
								+ "',original_amt='" + orig_amt
								+ "',amount_due='" + amt_due
								+ "',date_due='" + results.billpaymentdetails[i].itempush[j].date_due
								+ "',payment='" + payment
								+ "',disc_date=" + disc_date
								+ ",disc_avail='" + disc_avail
								+ "',disc_taken='" + disc_taken
								+ "' where bill_payment_id= '" + results.billpaymentdetails[i].ns_id
								+ "' AND bill_id='" + results.billpaymentdetails[i].itempush[j].bill_ns_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in bill_payment_lines :: " + update_query);
					var fields_bpl_update_details = {query:update_query};
					dbs.query(null,fields_bpl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');

		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

			});
		
	}

	else
	{
		var bill_payment_ns_id=req.query.bill_payment_ns_id;
		console.log("bill_payment_ns_id  "+bill_payment_ns_id);
		
		var rest_params = {"vendor_id":id,"event":"refresh","billpayment_id_ns":bill_payment_ns_id};
	
		function onFailure(err) {
		  process.stderr.write("Refresh Failed: " + err.message + "\n");
		 // process.exit(1);
		}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

		search.run(rest_params, function (err, results) {
				  if (err) onFailure(err);
 
				 if(results.status=='Successful')
				 {
				// create an arry of existing Item Receipts	
				
				console.log('results:::'+results);
				var parsed_response=JSON.stringify(results);
				console.log('parsed_response:::'+parsed_response);
				var header=results.status;
				  	
				
				   
				var data_len=results.billpaymentdetails.length;
				console.log('data_len:::'+data_len);
						
				console.log('status::'+header);
				console.log('datalength::'+data_len);
				console.log('itemdatalength::'+results.billpaymentdetails[0].itempush.length);
				console.log("transaction number : "+results.billpaymentdetails[0].Transaction_Number);
				console.log("bill Payment netsuite id : "+results.billpaymentdetails[0].ns_id);
				console.log("timestamp : "+results.updatetimestamp);
				
					
					function isItemInArray(array, item) {
				    		for (var i = 0; i < array.length; i++) {
					        // This if statement depends on the format of your array
					        if (array[i][0] == item[0] && array[i][1] == item[1]) {
					            return true;   // Found it
					        		}
					    		}
						    return false;   // Not found
						}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_bill_payment_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment',fields_bill_payment_list_details);
	var bill_payment_list=new Array(); 
	dbs.readData(function (result){
		
	
		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					bill_payment_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('bill_payment_list array::'+bill_payment_list);
	

// create a arry of existing BPs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_payment_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment_lines',fields_bill_payment_list_lines_details);
	var bill_payment_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				bill_payment_line_list[r]=new Array();
				bill_payment_line_list[r][0]=result1[r].bill_payment_id;
				bill_payment_line_list[r][1]=result1[r].bill_id;

			}
					console.log('bill_payment_line_list array::'+bill_payment_line_list);
		}
	
	

	
		
// insert or update BP  and BP lines
	 for(var i=0;i<results.billpaymentdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Bill Payment List :: ' + bill_payment_list);
		var index=bill_payment_list.indexOf(parseInt(results.billpaymentdetails[i].ns_id));
		console.log('index::'+index);
		
		var neg_factor_qty=1;
		if(results.billpaymentdetails[i].Amount<0)
		{
			neg_factor_qty=-1;
		}
	//	+ results.billpaymentdetails[i].bill_ns_id + "','"
		
		if(results.billpaymentdetails[i].ns_ext_id=='')
		{
			var ns_ext_id = 0;
			console.log("ns_ext_id if null :: " + ns_ext_id);
		}
		else 
		{
			var ns_ext_id = results.billpaymentdetails[i].ns_ext_id;
		}
		
		
		if(index<0)
		{
			var insert_query = "insert into bill_payment values('"
						+ results.billpaymentdetails[i].ns_id + "','"
						+ ns_ext_id + "','"
						+ results.billpaymentdetails[i].Transaction_Number + "','"
						+ results.billpaymentdetails[i].Payee + "','"
						+ results.billpaymentdetails[i].Amount*neg_factor_qty + "','"
						+ results.billpaymentdetails[i].date + "','"
						+ results.billpaymentdetails[i].Currency + "','"
						+ results.billpaymentdetails[i].Memo + "','"
						+ id + "')";
			console.log("Query for insert query in bill_payment :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_payment set ns_id='" + results.billpaymentdetails[i].ns_id
						+ "',ns_ext_id='" + ns_ext_id
						+ "',transaction_number='" + results.billpaymentdetails[i].Transaction_Number
						+ "',payee='" + results.billpaymentdetails[i].Payee
						+ "',amount='" + results.billpaymentdetails[i].Amount*neg_factor_qty
						+ "',created_date='" + results.billpaymentdetails[i].date
						+ "',currency='" + results.billpaymentdetails[i].Currency
						+ "',memo='" + results.billpaymentdetails[i].Memo
						+ "' where ns_id= '" + results.billpaymentdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for insert query in bill_payment :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billpaymentdetails[i].itempush.length;j++)
			{
				
				
				
				
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
				console.log('in j loop::'+[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				var is_exist=isItemInArray(bill_payment_line_list,[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				if(results.billpaymentdetails[i].itempush[j].payment==''||results.billpaymentdetails[i].itempush[j].payment==null)
				{
					var payment = 0;
					console.log("payment if null :: " + payment);
				}
				else 
				{
					var payment = results.billpaymentdetails[i].itempush[j].payment;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_avail==''||results.billpaymentdetails[i].itempush[j].disc_avail==null)
				{
					var disc_avail = 0;
					console.log("disc_avail if null :: " + disc_avail);
				}
				else 
				{
					var disc_avail = results.billpaymentdetails[i].itempush[j].disc_avail;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_taken==''||results.billpaymentdetails[i].itempush[j].disc_taken==null)
				{
					var disc_taken = 0;
					console.log("disc_taken if null :: " + disc_taken);
				}
				else 
				{
					var disc_taken = results.billpaymentdetails[i].itempush[j].disc_taken;
				}
				if(results.billpaymentdetails[i].itempush[j].orig_amt==''||results.billpaymentdetails[i].itempush[j].orig_amt==null)
				{
					var orig_amt = 0;
					console.log("orig_amt if null :: " + orig_amt);
				}
				else 
				{
					var orig_amt = results.billpaymentdetails[i].itempush[j].orig_amt;
				}
				if(results.billpaymentdetails[i].itempush[j].amt_due==''||results.billpaymentdetails[i].itempush[j].amt_due==null)
				{
					var amt_due = 0;
					console.log("amt_due if null :: " + amt_due);
				}
				else 
				{
					var amt_due = results.billpaymentdetails[i].itempush[j].amt_due;
				}
				
				if(results.billpaymentdetails[i].itempush[j].disc_date==''||results.billpaymentdetails[i].itempush[j].disc_date==null)
				{
					var disc_date = null;
					console.log("disc_date if null :: " + disc_date);
				}
				else 
				{
					var disc_date = "'" + results.billpaymentdetails[i].itempush[j].disc_date + "'" ;
				}
				console.log('is_exist::'+is_exist);
				
				if(!is_exist)
				{
						var insert_query = "insert into bill_payment_lines values('"
									+ results.billpaymentdetails[i].ns_id + "','"
									+ results.billpaymentdetails[i].itempush[j].type + "','"
									+ orig_amt + "','"
									+ amt_due + "','"
									+ results.billpaymentdetails[i].itempush[j].date_due + "','"
									+ payment + "',"
									+ disc_date + ",'"
									+ disc_avail + "','"
									+ disc_taken + "','"
									+ id + "','"
									+ results.billpaymentdetails[i].itempush[j].bill_ns_id + "')";
						console.log("Query for insert query in bill_payment_lines :: " + insert_query);
						var fields_bpl_insert_details = {query:insert_query};
						dbs.query(null,fields_bpl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_payment_lines set bill_payment_id='"+results.billpaymentdetails[i].ns_id
								+ "',type='" + results.billpaymentdetails[i].itempush[j].type
								+ "',original_amt='" + orig_amt
								+ "',amount_due='" + amt_due
								+ "',date_due='" + results.billpaymentdetails[i].itempush[j].date_due
								+ "',payment='" + payment
								+ "',disc_date=" + disc_date
								+ ",disc_avail='" + disc_avail
								+ "',disc_taken='" + disc_taken
								+ "' where bill_payment_id= '" + results.billpaymentdetails[i].ns_id
								+ "' AND bill_id='" + results.billpaymentdetails[i].itempush[j].bill_ns_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in bill_payment_lines :: " + update_query);
					var fields_bpl_update_details = {query:update_query};
					dbs.query(null,fields_bpl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');

		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
	}	
if(bill_payment_status=='none')
{
	setTimeout(function () {
           res.redirect(303,'/billpayments?notdata[]=' + notdata + '&count=' + count);
        }, 5000);

	
}
else
{
	setTimeout(function () {
           res.redirect(303,'/billpaymentsview?bill_payment_ns_id='+bill_payment_ns_id+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
}
}
else
{
	res.render('signout',{});
}
	

});

/* GET Item Receipt Pages. */
app.get('/billpayments', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("Bill Payments Page ");
	
	var rec_type='BillPayment';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";

	var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result)
	{
		if(result.length!=0)
		{
			var time_stamp = result[0].timestamp;
			console.log("time_stamp  "+time_stamp);
		}
		else
		{
			var now = new Date();
			var hours=now.getHours();
			if(now.getHours()>12)
			{
				hours=parseInt(now.getHours())-12;
			}
			function AddZero(num) 
			{
			    return (num >= 0 && num < 10) ? "0" + num : num + "";
			}
			var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
			console.log("New Time Stamp :: " + strDateTime);
			var time_stamp = strDateTime ;
		}
		rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
		function onFailure(err) {
  		process.stderr.write("Refresh Failed: " + err.message + "\n");
  		//process.exit(1);
		}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
		search.run(rest_params, function (err, results) {
		  if (err) onFailure(err);
 
		 if(results.status=='Successful')
		 {
				// create an arry of existing Item Receipts	
			console.log('results:::'+results);
			var parsed_response=JSON.stringify(results);
			console.log('parsed_response:::'+parsed_response);
			var header=results.status;
			var data_len=results.billpaymentdetails.length;
			 count = data_len;
			 var newnotf = data_len + " bill payment added /created." ;
			 notdata.push(newnotf);
			console.log('data_len:::'+data_len);
			console.log('status::'+header);
			console.log('datalength::'+data_len);
			console.log('itemdatalength::'+results.billpaymentdetails[0].itempush.length);
			console.log("transaction number : "+results.billpaymentdetails[0].Transaction_Number);
			console.log("bill Payment netsuite id : "+results.billpaymentdetails[0].ns_id);
			console.log("timestamp : "+results.updatetimestamp);
		
			function isItemInArray(array, item) {
		   		for (var i = 0; i < array.length; i++) {
					        // This if statement depends on the format of your array
				        if (array[i][0] == item[0] && array[i][1] == item[1]) {
				            return true;   // Found it
				        		}
				    		}
						    return false;   // Not found
				}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_bill_payment_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment',fields_bill_payment_list_details);
	var bill_payment_list=new Array(); 
	dbs.readData(function (result){
		
	
		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					bill_payment_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('bill_payment_list array::'+bill_payment_list);
	

// create a arry of existing BPs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_payment_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment_lines',fields_bill_payment_list_lines_details);
	var bill_payment_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				bill_payment_line_list[r]=new Array();
				bill_payment_line_list[r][0]=result1[r].bill_payment_id;
				bill_payment_line_list[r][1]=result1[r].bill_id;

			}
					console.log('bill_payment_line_list array::'+bill_payment_line_list);
		}
	
	

	
		
// insert or update BP  and BP lines
	 for(var i=0;i<results.billpaymentdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Bill Payment List :: ' + bill_payment_list);
		var index=bill_payment_list.indexOf(parseInt(results.billpaymentdetails[i].ns_id));
		console.log('index::'+index);
		
		var neg_factor_qty=1;
		if(results.billpaymentdetails[i].Amount<0)
		{
			neg_factor_qty=-1;
		}
	//	+ results.billpaymentdetails[i].bill_ns_id + "','"
		
		if(results.billpaymentdetails[i].ns_ext_id=='')
		{
			var ns_ext_id = 0;
			console.log("ns_ext_id if null :: " + ns_ext_id);
		}
		else 
		{
			var ns_ext_id = results.billpaymentdetails[i].ns_ext_id;
		}
		
		
		if(index<0)
		{
			var insert_query = "insert into bill_payment values('"
						+ results.billpaymentdetails[i].ns_id + "','"
						+ ns_ext_id + "','"
						+ results.billpaymentdetails[i].Transaction_Number + "','"
						+ results.billpaymentdetails[i].Payee + "','"
						+ results.billpaymentdetails[i].Amount*neg_factor_qty + "','"
						+ results.billpaymentdetails[i].date + "','"
						+ results.billpaymentdetails[i].Currency + "','"
						+ results.billpaymentdetails[i].Memo + "','"
						+ id + "')";
			console.log("Query for insert query in bill_payment :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_payment set ns_id='" + results.billpaymentdetails[i].ns_id
						+ "',ns_ext_id='" + ns_ext_id
						+ "',transaction_number='" + results.billpaymentdetails[i].Transaction_Number
						+ "',payee='" + results.billpaymentdetails[i].Payee
						+ "',amount='" + results.billpaymentdetails[i].Amount*neg_factor_qty
						+ "',created_date='" + results.billpaymentdetails[i].date
						+ "',currency='" + results.billpaymentdetails[i].Currency
						+ "',memo='" + results.billpaymentdetails[i].Memo
						+ "' where ns_id= '" + results.billpaymentdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for insert query in bill_payment :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billpaymentdetails[i].itempush.length;j++)
			{
				
				
				
				
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
				console.log('in j loop::'+[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				var is_exist=isItemInArray(bill_payment_line_list,[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				if(results.billpaymentdetails[i].itempush[j].payment==''||results.billpaymentdetails[i].itempush[j].payment==null)
				{
					var payment = 0;
					console.log("payment if null :: " + payment);
				}
				else 
				{
					var payment = results.billpaymentdetails[i].itempush[j].payment;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_avail==''||results.billpaymentdetails[i].itempush[j].disc_avail==null)
				{
					var disc_avail = 0;
					console.log("disc_avail if null :: " + disc_avail);
				}
				else 
				{
					var disc_avail = results.billpaymentdetails[i].itempush[j].disc_avail;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_taken==''||results.billpaymentdetails[i].itempush[j].disc_taken==null)
				{
					var disc_taken = 0;
					console.log("disc_taken if null :: " + disc_taken);
				}
				else 
				{
					var disc_taken = results.billpaymentdetails[i].itempush[j].disc_taken;
				}
				if(results.billpaymentdetails[i].itempush[j].orig_amt==''||results.billpaymentdetails[i].itempush[j].orig_amt==null)
				{
					var orig_amt = 0;
					console.log("orig_amt if null :: " + orig_amt);
				}
				else 
				{
					var orig_amt = results.billpaymentdetails[i].itempush[j].orig_amt;
				}
				if(results.billpaymentdetails[i].itempush[j].amt_due==''||results.billpaymentdetails[i].itempush[j].amt_due==null)
				{
					var amt_due = 0;
					console.log("amt_due if null :: " + amt_due);
				}
				else 
				{
					var amt_due = results.billpaymentdetails[i].itempush[j].amt_due;
				}
				
				if(results.billpaymentdetails[i].itempush[j].disc_date==''||results.billpaymentdetails[i].itempush[j].disc_date==null)
				{
					var disc_date = null;
					console.log("disc_date if null :: " + disc_date);
				}
				else 
				{
					var disc_date = "'" + results.billpaymentdetails[i].itempush[j].disc_date + "'" ;
				}
				console.log('is_exist::'+is_exist);
				
				if(!is_exist)
				{
						var insert_query = "insert into bill_payment_lines values('"
									+ results.billpaymentdetails[i].ns_id + "','"
									+ results.billpaymentdetails[i].itempush[j].type + "','"
									+ orig_amt + "','"
									+ amt_due + "','"
									+ results.billpaymentdetails[i].itempush[j].date_due + "','"
									+ payment + "',"
									+ disc_date + ",'"
									+ disc_avail + "','"
									+ disc_taken + "','"
									+ id + "','"
									+ results.billpaymentdetails[i].itempush[j].bill_ns_id + "')";
						console.log("Query for insert query in bill_payment_lines :: " + insert_query);
						var fields_bpl_insert_details = {query:insert_query};
						dbs.query(null,fields_bpl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_payment_lines set bill_payment_id='"+results.billpaymentdetails[i].ns_id
								+ "',type='" + results.billpaymentdetails[i].itempush[j].type
								+ "',original_amt='" + orig_amt
								+ "',amount_due='" + amt_due
								+ "',date_due='" + results.billpaymentdetails[i].itempush[j].date_due
								+ "',payment='" + payment
								+ "',disc_date=" + disc_date
								+ ",disc_avail='" + disc_avail
								+ "',disc_taken='" + disc_taken
								+ "' where bill_payment_id= '" + results.billpaymentdetails[i].ns_id
								+ "' AND bill_id='" + results.billpaymentdetails[i].itempush[j].bill_ns_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in bill_payment_lines :: " + update_query);
					var fields_bpl_update_details = {query:update_query};
					dbs.query(null,fields_bpl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');

		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

	});
		
	


//var id=req.query.vendorid;  
var page_title='Bill Payments';
var created_date=new Array();
var transaction_number=new Array();
var ns_id=new Array();
var payee =  new Array();
var amount = new Array();
var currency =  new Array();
var bill_ns_id = new Array();
//var poid = new Array();
var memo = new Array();
var ns_ext_id = new Array();
var time_stamp='';

//var timestamp_contents = db.exec("select timestamp from timestamp where rec_type= 'Bills'");
//var timestamp_contents = db.exec("select localtime from timestamp where rec_type= 'Bills'");
setTimeout(function(){
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:"'BillPayment'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result){
		if(result.length!=0)
		{
			console.log("result timestamp details :: "+ JSON.stringify(result));
			time_stamp = result[0].timestamp;
			console.log("time_stamp :: "+time_stamp);
		}
		else {/*
			var date_obj=new Date();
		Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
					
		var date_obj = new Date,
		    current_date = [(date_obj.getMonth()+1).padLeft(),
		               date_obj.getDate().padLeft(),
		               date_obj.getFullYear()].join('/') +' ' +
		              [date_obj.getHours().padLeft(),
		               date_obj.getMinutes().padLeft(),
		               date_obj.getSeconds().padLeft()].join(':');
			time_stamp =current_date;
		*/	
			var vndr={key:"VENDOR_NS_ID::integer",operator:"=",value:id};
				dbs.query('vendor_master',vndr);
				
				dbs.readData(function (results){
				var dat = dt.timestamp_formatter(results[0].date_created);
				setTimeout(function () {
				var timestamp_blp = "INSERT INTO timestamp VALUES('BillPayment','"
						+ dat + "','"
						+ dat + "','"
						+ results[0].vendor_ns_id + "')" ;
			
				console.log("Insert Query Timestamp BP ::" + timestamp_blp);
				var fields_timestamp_blp_create = {query:timestamp_blp};
				dbs.query(null,fields_timestamp_blp_create);
				dbs.update();
				},3000);
				time_stamp = results[0].date_created;
				console.log("current time_stamp check :: ");
				});
			
		}
	var fields_bill_payment_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment',fields_bill_payment_list_details);
	dbs.readData(function (result){
	console.log("result bill payment list :: "+ JSON.stringify(result));
	
	if(result != null)
	{
		console.log("contents length : " + result.length);
		
		for (var i=0; i<result.length; i++) 
		{
			if(result[i].ns_ext_id==0)
			{
				console.log("When NEtsuite_ext_id is null for Bill payments --> "  + ns_ext_id[i] ) ;
				ns_ext_id[i]='';
				console.log("When NEtsuite_ext_id is null for Bill payments afetr setting at ''--> "  + ns_ext_id[i] ) ;
			}
			else
			{
				ns_ext_id[i] = result[i].ns_ext_id;
			}
			transaction_number[i] = result[i].transaction_number;
			payee[i] = result[i].payee;
			amount[i] = result[i].amount;
			currency[i] = result[i].currency;
			console.log("Formatted date :: " + dt.date_formatter(result[i].created_date));
			created_date[i] = dt.date_formatter(result[i].created_date) ;
			//created_date[i] = result[i].created_date; 
			memo[i] = result[i].memo;
			ns_id[i] = result[i].ns_id;
			
			
			
			console.log("created_date "+created_date);
			console.log("transaction_number"+transaction_number);
			console.log("payee" + payee );
			console.log("amount" + amount);
			console.log("currency" + currency);
			console.log("ns_id "+ns_id);
			console.log("memo "+memo);
			console.log("ns_ext_id " + ns_ext_id);
			

			console.log("*****************************");
		}
	
  res.render('billpayments', { //render the index.ejs
	 
	  tran_id:ns_ext_id,
	  tran_trans_no:transaction_number,
	  tran_payee:payee,
	  tran_amt:amount,
	  tran_currency:currency,
	  tran_date:created_date,
	  tran_ns_id:ns_id,
	  tran_memo:memo,
	  title:page_title,
	  vendorname:vendor_name,
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  time_stamp_val:time_stamp,
	  contentlength:result.length
	  
  });
	}
	else
	{
		res.render('billpayments',{
			 contentlength:0,
			 title:page_title,
			 vendorname:vendor_name,
			 time_stamp_val:time_stamp,
			 notdata_rend:notdata,
	  		 count_rend:count,
			 v_id:id
		});
	}
		});
	});
},3000);
}
else
{
	res.render('signout',{});
}

	
});

/* GET Item Receipt View Page */
app.get('/billpaymentsview', requireLogin, function(req, res, next) {

if(id)
{
		var rec_type='BillPayment';
		rec_type= "'" + rec_type + "'" ; 
		console.log("Bill Payments View page ");
		bill_payment_ns_id=req.query.bill_payment_ns_id;
		console.log("bill_payment_ns_id  "+bill_payment_ns_id);

		
		var rest_params = {"vendor_id":id,"event":"refresh","billpayment_id_ns":bill_payment_ns_id};
	
		function onFailure(err) {
		  process.stderr.write("Refresh Failed: " + err.message + "\n");
		  //process.exit(1);
		}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

		search.run(rest_params, function (err, results) {
				  if (err) onFailure(err);
 
				 if(results.status=='Successful')
				 {
				// create an arry of existing Item Receipts	
				
				console.log('results:::'+results);
				var parsed_response=JSON.stringify(results);
				console.log('parsed_response:::'+parsed_response);
				var header=results.status;
				  	
				
				   
				var data_len=results.billpaymentdetails.length;
				console.log('data_len:::'+data_len);
						
				console.log('status::'+header);
				console.log('datalength::'+data_len);
				console.log('itemdatalength::'+results.billpaymentdetails[0].itempush.length);
				console.log("transaction number : "+results.billpaymentdetails[0].Transaction_Number);
				console.log("bill Payment netsuite id : "+results.billpaymentdetails[0].ns_id);
				console.log("timestamp : "+results.updatetimestamp);
				
					
					function isItemInArray(array, item) {
				    		for (var i = 0; i < array.length; i++) {
					        // This if statement depends on the format of your array
					        if (array[i][0] == item[0] && array[i][1] == item[1]) {
					            return true;   // Found it
					        		}
					    		}
						    return false;   // Not found
						}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_bill_payment_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment',fields_bill_payment_list_details);
	var bill_payment_list=new Array(); 
	dbs.readData(function (result){
		
	
		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					bill_payment_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('bill_payment_list array::'+bill_payment_list);
	

// create a arry of existing BPs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_bill_payment_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('bill_payment_lines',fields_bill_payment_list_lines_details);
	var bill_payment_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				bill_payment_line_list[r]=new Array();
				bill_payment_line_list[r][0]=result1[r].bill_payment_id;
				bill_payment_line_list[r][1]=result1[r].bill_id;

			}
					console.log('bill_payment_line_list array::'+bill_payment_line_list);
		}
	
	

	
		
// insert or update BP  and BP lines
	 for(var i=0;i<results.billpaymentdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Bill Payment List :: ' + bill_payment_list);
		var index=bill_payment_list.indexOf(parseInt(results.billpaymentdetails[i].ns_id));
		console.log('index::'+index);
		
		var neg_factor_qty=1;
		if(results.billpaymentdetails[i].Amount<0)
		{
			neg_factor_qty=-1;
		}
	//	+ results.billpaymentdetails[i].bill_ns_id + "','"
		
		if(results.billpaymentdetails[i].ns_ext_id=='')
		{
			var ns_ext_id = 0;
			console.log("ns_ext_id if null :: " + ns_ext_id);
		}
		else 
		{
			var ns_ext_id = results.billpaymentdetails[i].ns_ext_id;
		}
		
		
		if(index<0)
		{
			var insert_query = "insert into bill_payment values('"
						+ results.billpaymentdetails[i].ns_id + "','"
						+ ns_ext_id + "','"
						+ results.billpaymentdetails[i].Transaction_Number + "','"
						+ results.billpaymentdetails[i].Payee + "','"
						+ results.billpaymentdetails[i].Amount*neg_factor_qty + "','"
						+ results.billpaymentdetails[i].date + "','"
						+ results.billpaymentdetails[i].Currency + "','"
						+ results.billpaymentdetails[i].Memo + "','"
						+ id + "')";
			console.log("Query for insert query in bill_payment :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update bill_payment set ns_id='" + results.billpaymentdetails[i].ns_id
						+ "',ns_ext_id='" + ns_ext_id
						+ "',transaction_number='" + results.billpaymentdetails[i].Transaction_Number
						+ "',payee='" + results.billpaymentdetails[i].Payee
						+ "',amount='" + results.billpaymentdetails[i].Amount*neg_factor_qty
						+ "',created_date='" + results.billpaymentdetails[i].date
						+ "',currency='" + results.billpaymentdetails[i].Currency
						+ "',memo='" + results.billpaymentdetails[i].Memo
						+ "' where ns_id= '" + results.billpaymentdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for insert query in bill_payment :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.billpaymentdetails[i].itempush.length;j++)
			{
				
				
				
				
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
				console.log('in j loop::'+[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				var is_exist=isItemInArray(bill_payment_line_list,[results.billpaymentdetails[i].ns_id,results.billpaymentdetails[i].itempush[j].bill_ns_id]);
				
				if(results.billpaymentdetails[i].itempush[j].payment==''||results.billpaymentdetails[i].itempush[j].payment==null)
				{
					var payment = 0;
					console.log("payment if null :: " + payment);
				}
				else 
				{
					var payment = results.billpaymentdetails[i].itempush[j].payment;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_avail==''||results.billpaymentdetails[i].itempush[j].disc_avail==null)
				{
					var disc_avail = 0;
					console.log("disc_avail if null :: " + disc_avail);
				}
				else 
				{
					var disc_avail = results.billpaymentdetails[i].itempush[j].disc_avail;
				}
				if(results.billpaymentdetails[i].itempush[j].disc_taken==''||results.billpaymentdetails[i].itempush[j].disc_taken==null)
				{
					var disc_taken = 0;
					console.log("disc_taken if null :: " + disc_taken);
				}
				else 
				{
					var disc_taken = results.billpaymentdetails[i].itempush[j].disc_taken;
				}
				if(results.billpaymentdetails[i].itempush[j].orig_amt==''||results.billpaymentdetails[i].itempush[j].orig_amt==null)
				{
					var orig_amt = 0;
					console.log("orig_amt if null :: " + orig_amt);
				}
				else 
				{
					var orig_amt = results.billpaymentdetails[i].itempush[j].orig_amt;
				}
				if(results.billpaymentdetails[i].itempush[j].amt_due==''||results.billpaymentdetails[i].itempush[j].amt_due==null)
				{
					var amt_due = 0;
					console.log("amt_due if null :: " + amt_due);
				}
				else 
				{
					var amt_due = results.billpaymentdetails[i].itempush[j].amt_due;
				}
				
				if(results.billpaymentdetails[i].itempush[j].disc_date==''||results.billpaymentdetails[i].itempush[j].disc_date==null)
				{
					var disc_date = null;
					console.log("disc_date if null :: " + disc_date);
				}
				else 
				{
					var disc_date = "'" + results.billpaymentdetails[i].itempush[j].disc_date + "'" ;
				}
				console.log('is_exist::'+is_exist);
				
				if(!is_exist)
				{
						var insert_query = "insert into bill_payment_lines values('"
									+ results.billpaymentdetails[i].ns_id + "','"
									+ results.billpaymentdetails[i].itempush[j].type + "','"
									+ orig_amt + "','"
									+ amt_due + "','"
									+ results.billpaymentdetails[i].itempush[j].date_due + "','"
									+ payment + "',"
									+ disc_date + ",'"
									+ disc_avail + "','"
									+ disc_taken + "','"
									+ id + "','"
									+ results.billpaymentdetails[i].itempush[j].bill_ns_id + "')";
						console.log("Query for insert query in bill_payment_lines :: " + insert_query);
						var fields_bpl_insert_details = {query:insert_query};
						dbs.query(null,fields_bpl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update bill_payment_lines set bill_payment_id='"+results.billpaymentdetails[i].ns_id
								+ "',type='" + results.billpaymentdetails[i].itempush[j].type
								+ "',original_amt='" + orig_amt
								+ "',amount_due='" + amt_due
								+ "',date_due='" + results.billpaymentdetails[i].itempush[j].date_due
								+ "',payment='" + payment
								+ "',disc_date=" + disc_date
								+ ",disc_avail='" + disc_avail
								+ "',disc_taken='" + disc_taken
								+ "' where bill_payment_id= '" + results.billpaymentdetails[i].ns_id
								+ "' AND bill_id='" + results.billpaymentdetails[i].itempush[j].bill_ns_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in bill_payment_lines :: " + update_query);
					var fields_bpl_update_details = {query:update_query};
					dbs.query(null,fields_bpl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
	/*	var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');
		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
	*/
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
	
		
		//var contents = db.exec("select * from bill_list where BILL_LIST_NS_ID = "+bill_ns_id);
	setTimeout(function(){
		var fields_bill_payment_details= {key:"ns_id",operator:"=",value:bill_payment_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('bill_payment',fields_bill_payment_details);
		dbs.readData(function (result1){
			console.log("result bill_payment details :: "+ JSON.stringify(result1));
			console.log("contents length : "+result1.length);
			for (var i=0; i<result1.length; i++) 
			{
			
				if(result1[i].ns_ext_id==0)
				{
					ns_ext_id='';
				}
				else
				{
					ns_ext_id = result1[i].ns_ext_id;
				}
			
			//	ns_ext_id = result1[i].ns_ext_id;
				transaction_number = result1[i].transaction_number;
				payee = result1[i].payee;
				amount = result1[i].amount;
				currency = result1[i].currency;
				created_date = dt.date_formatter(result1[i].created_date); 
				memo = result1[i].memo;
				ns_id = result1[i].ns_id;
			} 
		
		/*
		var bill_line_contents = client.query("select * from BILL_LIST_LINES where BILL_LIST_NS_ID = "+bill_ns_id);
		bill_line_contents.on("end", function (result) {          
		console.log('Purchase Order View');
		client.end();
			
		});
		*/
		//var bill_line_contents = db.exec("select * from BILL_LIST_LINES where BILL_LIST_NS_ID = "+bill_ns_id);
		
		var fields_bill_payment_line_contents= {key:"bill_payment_id",operator:"=",value:bill_payment_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('bill_payment_lines',fields_bill_payment_line_contents);
		dbs.readData(function (result){
			console.log("result bill_payment details :: "+ JSON.stringify(result));
			console.log("contents length : "+result.length);
			
		
			if(result!=null)
			{
				console.log("bill payment line contents length : "+result.length);
				var items_data = new Array();
			
				for (var i=0; i<result.length; i++) 
				{
				var item = new Object();
				
				item.bill_payment_id_val= result[i].bill_payment_id;
				console.log("item.bill_payment_id_val  "+item.bill_payment_id_val);
				
				item.type_val = result[i].type; 
				item.original_amt_val = result[i].original_amt;
				item.amount_due_val = result[i].amount_due;
				item.date_due_val = dt.date_formatter(result[i].date_due);
				item.payment_val = result[i].payment;
				item.disc_date_val = dt.date_formatter(result[i].disc_date);
				item.disc_avail_val = result[i].disc_avail;
				item.disc_taken_val = result[i].disc_taken;
				item.bill_id_val = result[i].bill_id; 
				items_data.push(item);
				
				}  
			
			
			
			console.log("items_data "+items_data);
			console.log("items_data "+JSON.stringify(items_data));
			setTimeout(function () {
			res.render('billpaymentsview',{ //render the index.ejs
		 
			  v_id:id,
			  notdata_rend:notdata,
	  		  count_rend:count,
			  vendorname:vendor_name,
			  bill_payment_ns_id_val:bill_payment_ns_id,
			  ns_ext_id_val:ns_ext_id,
			  trans_no:transaction_number,
			  tran_payee:payee,
			  tran_amount:amount,
			  tran_currency:currency,
			  tran_date:created_date,
			  tran_memo:memo,
			  items:items_data,
			  line_length:result.length
			});
			},3000);
			}		
		else
		{
			res.render('billpaymentsview', { //render the index.ejs
		 
		  v_id:id,
		  notdata_rend:notdata,
	  	  count_rend:count,
		  vendorname:vendor_name,
		  bill_payment_ns_id_val:bill_payment_ns_id,
		  ns_ext_id_val:ns_ext_id,
		  tran_date:created_date,
		  line_length:0
		
		  
	  });
		}
});
			
		});	
	},3000);
}
else
{
	res.render('signout',{});
}	// route for '/'

});

/*GET refresh page for Item Receipts. */
app.get('/refreshitemreceipts', requireLogin, function(req, res, next) {
	
if(id)
{
		console.log("Item Receipts Refresh page ");
	
	//RecordType.rec_type=req.query.record_type;
	var rec_type='ItemReceipt';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	var item_receipt_status=req.query.item_receipt_status;
	console.log("item receipt status  "+item_receipt_status);
	var rest_params = null;
	if(item_receipt_status=='none')	
	{
		
		var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		console.log('Before timestamp details :: ');
		dbs.query('timestamp',fields_timestamp_details);
		dbs.readData(function (result)
			{
				if(result.length!=0)
				{
					var time_stamp = result[0].timestamp;
					console.log("time_stamp  "+time_stamp);
				}
				else
				{
					
					var now = new Date();
	
					var hours=now.getHours();
					
					if(now.getHours()>12)
					{
						hours=parseInt(now.getHours())-12;
					}
					function AddZero(num) 
					{
					    return (num >= 0 && num < 10) ? "0" + num : num + "";
					}
					var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
					console.log("New Time Stamp :: " + strDateTime);
					var time_stamp = strDateTime ;
				}
				rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
				function onFailure(err) {
  				process.stderr.write("Refresh Failed: " + err.message + "\n");
  				//process.exit(1);
					}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

				search.run(rest_params, function (err, results) {
				  if (err) onFailure(err);
 
				 if(results.status=='Successful')
				 {
				// create an arry of existing Item Receipts	
				
				console.log('results:::'+results);
				var parsed_response=JSON.stringify(results);
				console.log('parsed_response:::'+parsed_response);
				var header=results.status;
				  	
				
				   
				var data_len=results.itemreceiptdetails.length;
				console.log('data_len:::'+data_len);
						
				console.log('status::'+header);
				console.log('datalength::'+data_len);
				console.log('itemdatalength::'+results.itemreceiptdetails[0].itempush.length);
				console.log("tranID : "+results.itemreceiptdetails[0].tranID);
				console.log("item_id : "+results.itemreceiptdetails[0].itempush[0].item_id);
				console.log("timestamp : "+results.updatetimestamp);
				
					
					function isItemInArray(array, item) {
				    		for (var i = 0; i < array.length; i++) {
					        // This if statement depends on the format of your array
					        if (array[i][0] == item[0] && array[i][1] == item[1]) {
					            return true;   // Found it
					        		}
					    		}
						    return false;   // Not found
						}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_item_receipt_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('item_receipt',fields_item_receipt_list_details);
	var item_receipt_list=new Array(); 
	dbs.readData(function (result){
		
	
		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					item_receipt_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('item_receipt_list array::'+item_receipt_list);
	

// create a arry of existing POs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_item_receipt_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('item_receipt_lines',fields_item_receipt_list_lines_details);
	var item_receipt_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				item_receipt_line_list[r]=new Array();
				item_receipt_line_list[r][0]=result1[r].item_receipt_id;
				item_receipt_line_list[r][1]=result1[r].item_id;

			}
					console.log('item_receipt_line_list array::'+item_receipt_line_list);
		}
	
	

	
		
// insert or update IR  and IR lines
	 for(var i=0;i<results.itemreceiptdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Item Receipt List :: ' + item_receipt_list);
		var index=item_receipt_list.indexOf(parseInt(results.itemreceiptdetails[i].ns_id));
		console.log('index::'+index);
		
		
		
		if(index<0)
		{
			var insert_query = "insert into item_receipt values('"
						+ results.itemreceiptdetails[i].ns_id + "','"
						+ results.itemreceiptdetails[i].tranID + "','"
						+ results.itemreceiptdetails[i].createddate + "','"
						+ results.itemreceiptdetails[i].po_tranId + "','"
						+ results.itemreceiptdetails[i].po_id + "','"
						+ results.itemreceiptdetails[i].currency + "','"
						+ results.itemreceiptdetails[i].memo + "','"
						+ id + "')";
			console.log("Query for insert query in item_receipt :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update item_receipt set ns_id='" + results.itemreceiptdetails[i].ns_id
						+ "',ns_ext_id='" + results.itemreceiptdetails[i].tranID
						+ "',created_date='" + results.itemreceiptdetails[i].createddate
						+ "',purchase_order_ext_id='" + results.itemreceiptdetails[i].po_tranId
						+ "',purchase_order_id='" + results.itemreceiptdetails[i].po_id
						+ "',currency='" + results.itemreceiptdetails[i].currency
						+ "',memo='" + results.itemreceiptdetails[i].memo
						+ "' where ns_id= '" + results.itemreceiptdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for insert query in item_receipt :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		 
			for(var j=0;j<results.itemreceiptdetails[i].itempush.length;j++)
			{
				
				
				
				var neg_factor_qty=1;
					if(results.itemreceiptdetails[i].itempush[j].quantity_received<1)
					{
						neg_factor_qty=-1;
					}
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
				console.log('in j loop::'+[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
				
				var is_exist=isItemInArray(item_receipt_line_list,[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
				
				console.log('is_exist::'+is_exist);
				
				if(!is_exist)
				{
						var insert_query = "insert into item_receipt_lines values('"
									+ results.itemreceiptdetails[i].ns_id + "','"
									+ results.itemreceiptdetails[i].itempush[j].item_id + "','"
									+ results.itemreceiptdetails[i].itempush[j].quantity_received + "','"
									+ results.itemreceiptdetails[i].itempush[j].item_name + "','"
									+ results.itemreceiptdetails[i].itempush[j].vendor_prod_name + "','"
									+ id + "')";
						console.log("Query for insert query in item_receipt_lines :: " + insert_query);
						var fields_irl_insert_details = {query:insert_query};
						dbs.query(null,fields_irl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update item_receipt_lines set item_receipt_id='"+results.itemreceiptdetails[i].ns_id
								+ "',item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
								+ "',quantity_received='" + results.itemreceiptdetails[i].itempush[j].quantity_received
								+ "',item_name='" + results.itemreceiptdetails[i].itempush[j].item_name
								+ "',vendor_prod_name='" + results.itemreceiptdetails[i].itempush[j].vendor_prod_name
								+ "' where item_receipt_id= '" + results.itemreceiptdetails[i].ns_id
								+ "' AND item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in item_receipt_lines :: " + update_query);
					var fields_irl_update_details = {query:update_query};
					dbs.query(null,fields_irl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');

		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

			});
		
	}

	else
	{
		var item_receipt_ns_id=req.query.item_receipt_ns_id;
		console.log("item_receipt_ns_id  "+item_receipt_ns_id);
		
		var rest_params = {"vendor_id":id,"event":"refresh","itemreceipt_id_ns":item_receipt_ns_id};
	
		function onFailure(err) {
		  process.stderr.write("Refresh Failed: " + err.message + "\n");
		  //process.exit(1);
		}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

		search.run(rest_params, function (err, results) {
		  if (err) onFailure(err);
		 
		 if(results.status=='Successful')
		 {
			 
		 
		   console.log('results:::'+results);
		  var parsed_response=JSON.stringify(results);
			console.log('parsed_response:::'+parsed_response);
		  var header=results.status;
		  	
		
		   
		  var data_len=results.itemreceiptdetails.length;
		  console.log('data_len:::'+data_len);
				
			console.log('status::'+header);
			console.log('datalength::'+data_len);
			console.log('itemdatalength::'+results.itemreceiptdetails[0].itempush.length);
			console.log("tranID : "+results.itemreceiptdetails[0].tranID);
			console.log("item_id : "+results.itemreceiptdetails[0].itempush[0].item_id);
			console.log("timestamp : "+results.updatetimestamp);
		
		
			function isItemInArray(array, item) {
		    for (var i = 0; i < array.length; i++) {
		        // This if statement depends on the format of your array
		        if (array[i][0] == item[0] && array[i][1] == item[1]) {
		            return true;   // Found it
		        }
		    }
		    return false;   // Not found
		}
			
			
		// create an arry of existing IRs	
			
			var fields_item_receipt_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
			dbs.query('item_receipt',fields_item_receipt_list_details);
			var item_receipt_list=new Array(); 
			dbs.readData(function (result){
				
			
				if(result!=null)
				{
					for(var r=0;r<result.length; r++) 
						{
							item_receipt_list[r]=result[r].ns_id;
						}
			
					console.log('item_receipt_list array::'+item_receipt_list);
				}
			
			
			//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
			/*contents.on("end", function (result) {          
			console.log('Purchase Order View');
			client.end();
				
			});
			*/
			//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");
		
		
		
		// create a arry of existing POs	
			//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
			
			var fields_item_receipt_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
			dbs.query('item_receipt_lines',fields_item_receipt_lines_details);
			var item_receipt_line_list=new Array();
			dbs.readData(function (result){
		
				 
			
				if(result!=null)
				{
			
					for(var r=0;r<result.length; r++) 
					{
						item_receipt_line_list[r]=new Array();
						item_receipt_line_list[r][0]=result[r].item_receipt_id;
						item_receipt_line_list[r][1]=result[r].item_id;
		
					}
							console.log('item_receipt_line_list array::'+item_receipt_line_list);
				}
		
		
				
		// insert or update PO and PO lines
			 for(var i=0;i<results.itemreceiptdetails.length;i++)
			{
				console.log('in i loop::');
				
				var index=item_receipt_list.indexOf(parseInt(results.itemreceiptdetails[i].ns_id));
				console.log('index::'+index);
				
				
				
				if(index<0)
				{
					var insert_query = "insert into item_receipt values('"
								+ results.itemreceiptdetails[i].ns_id + "','"
								+ results.itemreceiptdetails[i].tranID + "','"
								+ results.itemreceiptdetails[i].createddate + "','"
								+ results.itemreceiptdetails[i].po_tranId + "','"
								+ results.itemreceiptdetails[i].po_id + "','"
								+ results.itemreceiptdetails[i].currency + "','"
								+ results.itemreceiptdetails[i].memo + "','"
								+ id + "')";
					var fields_insert_details = {query:insert_query};
					dbs.query(null,fields_insert_details);
					dbs.update();
					
				}
				else
				{
					var update_query= "update item_receipt set ns_id='" + results.itemreceiptdetails[i].ns_id
								+ "',ns_ext_id='" + results.itemreceiptdetails[i].tranID
								+ "',created_date='" + results.itemreceiptdetails[i].createddate
								+ "',purchase_order_ext_id='" + results.itemreceiptdetails[i].po_tranId
								+ "',purchase_order_id='" + results.itemreceiptdetails[i].po_id
								+ "',currency='" + results.itemreceiptdetails[i].currency
								+ "',memo='" + results.itemreceiptdetails[i].memo
								+ "' where ns_id= '" + results.itemreceiptdetails[i].ns_id
								+ "' AND vendor_ns_id='" + id + "'";
					var fields_update_details = {query:update_query};
					dbs.query(null,fields_update_details);
					dbs.update();
				}
				 
				 
					for(var j=0;j<results.itemreceiptdetails[i].itempush.length;j++)
					{
						
						
						
						var neg_factor_qty=1;
							if(results.itemreceiptdetails[i].itempush[j].quantity_received<1)
							{
								neg_factor_qty=-1;
							}
							/*		var neg_factor_amt=1;
							if(results.itemreceiptdetails[i].itempush[j].amount<1)
							{
								neg_factor_amt=-1;
							}
							*/
						console.log('in j loop::'+[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
						
						var is_exist=isItemInArray(item_receipt_line_list,[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
						
						console.log('is_exist::'+is_exist);
						
						if(!is_exist)
						{
							var insert_query = "insert into item_receipt_lines values('"
										+ results.itemreceiptdetails[i].ns_id + "','"
										+ results.itemreceiptdetails[i].itempush[j].item_id + "','"
										+ results.itemreceiptdetails[i].itempush[j].quantity_received + "','"
										+ results.itemreceiptdetails[i].itempush[j].item_name + "','"
										+ results.itemreceiptdetails[i].itempush[j].vendor_prod_name + "','"
										+ id + "')";
							var fields_irl_insert_details = {query:insert_query};
							dbs.query(null,fields_irl_insert_details);
							dbs.update();
							//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
						}
						else
						{
							var update_query = "update item_receipt_lines set item_receipt_id='"+results.itemreceiptdetails[i].ns_id
										+ "',item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
										+ "',quantity_received='" + results.itemreceiptdetails[i].itempush[j].quantity_received
										+ "',item_name='" + results.itemreceiptdetails[i].itempush[j].item_name
										+ "',vendor_prod_name='" + results.itemreceiptdetails[i].itempush[j].vendor_prod_name
										+ "' where item_receipt_id= '" + results.itemreceiptdetails[i].ns_id
										+ "' AND item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
										+ "' AND vendor_ns_id='" + id + "'"; 
							var fields_irl_update_details = {query:update_query};
							dbs.query(null,fields_irl_update_details);
							dbs.update();
							 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
						}
					} 
				}
			});
			});
				var date_obj=new Date();
			Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
			
				var date_obj = new Date,
		    current_date = [(date_obj.getMonth()+1).padLeft(),
		               date_obj.getDate().padLeft(),
		               date_obj.getFullYear()].join('/') +' ' +
		              [date_obj.getHours().padLeft(),
		               date_obj.getMinutes().padLeft(),
		               date_obj.getSeconds().padLeft()].join(':');
		
				var update_query = "update timestamp set timestamp='" + results.updatetimestamp
							+ "',local_time='" + current_date
							+ "' where rec_type=" + rec_type
							+" AND vendor_ns_id::integer='" + id +"'";
				var fields_irl_timestamp_update = {query:update_query};
				dbs.query(null,fields_irl_timestamp_update);
				dbs.update();
				//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
				//client.end();
			/*var data = db.export();
			var buffer = new Buffer(data);
				console.log('fs::'+fs);
			fs.writeFileSync("supplier_master.db", buffer);
			*/
			}
			});
	}	
if(item_receipt_status=='none')
{
	setTimeout(function () {
           res.redirect(303,'/ItemReceipts?notdata[]='+notdata+'&count='+count);
        }, 5000);

	
}
else
{
	setTimeout(function () {
           res.redirect(303,'/ItemReceiptsView?ns_id='+item_receipt_ns_id+'&notdata[]='+notdata+'&count='+count);
        }, 5000);
	
}
}
else
{
	res.render('signout',{});
}
	

});

/* GET Item Receipt Pages. */
app.get('/itemreceipts', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
	console.log("Item Receipt Page ");
	
	var rec_type='ItemReceipt';
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);
	rec_type = "'" + rec_type + "'";
	
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:rec_type,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result5)
	{
		if(result5.length!=0)
		{
			var time_stamp = result5[0].timestamp;
			console.log("time_stamp  "+time_stamp);
		}
		else
		{
			
			var now = new Date();

			var hours=now.getHours();
			
			if(now.getHours()>12)
			{
				hours=parseInt(now.getHours())-12;
			}
			function AddZero(num) 
			{
			    return (num >= 0 && num < 10) ? "0" + num : num + "";
			}
			var strDateTime = [[AddZero(now.getMonth() + 1), AddZero(now.getDate()), now.getFullYear()].join("/"), [AddZero(hours), AddZero(now.getMinutes())].join(":"), now.getHours() >= 12 ? "PM" : "AM"].join(" ");
			console.log("New Time Stamp :: " + strDateTime);
			var time_stamp = strDateTime ;
		}
		rest_params = {"vendor_id":id,"event":"refresh","timestamp":time_stamp};
		
// This will try the cached version first, if not there will run and then cache
// trigger the restlet


		search.run(rest_params, function (err, results) {
		  
		  	function onFailure(err) {
  		process.stderr.write("Refresh Failed: " + err.message + "\n");
  		//process.exit(1);
			}
		  
		  if (err) onFailure(err);
		

		 if(results.status=='Successful')
		 {
		// create an arry of existing Item Receipts	
		
		console.log('results:::'+results);
		var parsed_response=JSON.stringify(results);
		console.log('parsed_response:::'+parsed_response);
		var header=results.status;
		  	
		
		   
		var data_len=results.itemreceiptdetails.length;
		console.log('data_len:::'+data_len);
		count= data_len;
		var newnotf = data_len + " Item Receipt created/updated.";	 
		notadta.push(newnotf);
			 
		console.log('status::'+header);
		console.log('datalength::'+data_len);
		console.log('itemdatalength::'+results.itemreceiptdetails[0].itempush.length);
		console.log("tranID : "+results.itemreceiptdetails[0].tranID);
		console.log("item_id : "+results.itemreceiptdetails[0].itempush[0].item_id);
		console.log("timestamp : "+results.updatetimestamp);
		
			
			function isItemInArray(array, item) {
		    		for (var i = 0; i < array.length; i++) {
			        // This if statement depends on the format of your array
			        if (array[i][0] == item[0] && array[i][1] == item[1]) {
			            return true;   // Found it
			        		}
			    		}
				    return false;   // Not found
				}
	//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
	/*contents.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
		
	});
	*/
	//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");

	var fields_item_receipt_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('item_receipt',fields_item_receipt_list_details);
	var item_receipt_list=new Array(); 
	dbs.readData(function (result){

		if(result!=null)
		{
			for(var r=0;r<result.length; r++) 
				{
					item_receipt_list[r]=result[r].ns_id;
				}
	
			
		}
	console.log('item_receipt_list array::'+item_receipt_list);
	

// create a arry of existing POs	
	//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
	
	var fields_item_receipt_list_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('item_receipt_lines',fields_item_receipt_list_lines_details);
	var item_receipt_line_list=new Array();
	dbs.readData(function (result1){

		 
	
		if(result1!=null)
		{
	
			for(var r=0;r<result1.length; r++) 
			{
				item_receipt_line_list[r]=new Array();
				item_receipt_line_list[r][0]=result1[r].item_receipt_id;
				item_receipt_line_list[r][1]=result1[r].item_id;

			}
					console.log('item_receipt_line_list array::'+item_receipt_line_list);
		}
	
	

	
		
// insert or update IR  and IR lines
	 for(var i=0;i<results.itemreceiptdetails.length;i++)
	{
		console.log('in i loop::');
		
		console.log('Item Receipt List :: ' + item_receipt_list);
		var index=item_receipt_list.indexOf(parseInt(results.itemreceiptdetails[i].ns_id));
		console.log('index::'+index);
		
		
		
		if(index<0)
		{
			var insert_query = "insert into item_receipt values('"
						+ results.itemreceiptdetails[i].ns_id + "','"
						+ results.itemreceiptdetails[i].tranID + "','"
						+ results.itemreceiptdetails[i].createddate + "','"
						+ results.itemreceiptdetails[i].po_tranId + "','"
						+ results.itemreceiptdetails[i].po_id + "','"
						+ results.itemreceiptdetails[i].currency + "','"
						+ results.itemreceiptdetails[i].memo + "','"
						+ id + "')";
			console.log("Query for insert query in item_receipt :: " + insert_query);
			var fields_insert_details = {query:insert_query};
			dbs.query(null,fields_insert_details);
			dbs.update();
			//db.run("insert into bill_list('BILL_LIST_NS_ID','AMOUNT','BILL_DATE','po_id','MEMO')values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].total+"','"+results.billdetails[i].tranDate+"','"+results.billdetails[i].poNumber+"','"+results.billdetails[i].memo+"')");
		}
		else
		{
			var update_query= "update item_receipt set ns_id='" + results.itemreceiptdetails[i].ns_id
						+ "',ns_ext_id='" + results.itemreceiptdetails[i].tranID
						+ "',created_date='" + results.itemreceiptdetails[i].createddate
						+ "',purchase_order_ext_id='" + results.itemreceiptdetails[i].po_tranId
						+ "',purchase_order_id='" + results.itemreceiptdetails[i].po_id
						+ "',currency='" + results.itemreceiptdetails[i].currency
						+ "',memo='" + results.itemreceiptdetails[i].memo
						+ "' where ns_id= '" + results.itemreceiptdetails[i].ns_id
						+ "' AND vendor_ns_id='" + id + "'";
			console.log("Query for update query in item_receipt :: " + update_query);
			var fields_update_details = {query:update_query};
			dbs.query(null,fields_update_details);
			dbs.update();
			//db.run("update bill_list set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',BILL_DATE='"+results.billdetails[i].tranDate+"',po_id='"+results.billdetails[i].poNumber+"',AMOUNT='"+results.billdetails[i].total+"',memo='"+results.billdetails[i].memo+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"'"); 
		
		}
		 
		for(var j=0;j<results.itemreceiptdetails[i].itempush.length;j++)
		{
			var neg_factor_qty=1;
			if(results.itemreceiptdetails[i].itempush[j].quantity_received<1)
			{
				neg_factor_qty=-1;
			}
				/*			var neg_factor_amt=1;
					if(results.billdetails[i].itempush[j].amount<1)
					{
						neg_factor_amt=-1;
					}
				*/
			console.log('in j loop::'+[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
				
			var is_exist=isItemInArray(item_receipt_line_list,[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
			
			console.log('is_exist::'+is_exist);
				
			if(!is_exist)
				{
						var insert_query = "insert into item_receipt_lines values('"
									+ results.itemreceiptdetails[i].ns_id + "','"
									+ results.itemreceiptdetails[i].itempush[j].item_id + "','"
									+ results.itemreceiptdetails[i].itempush[j].quantity_received + "','"
									+ results.itemreceiptdetails[i].itempush[j].item_name + "','"
									+ results.itemreceiptdetails[i].itempush[j].vendor_prod_name + "','"
									+ id + "')";
						console.log("Query for insert query in item_receipt_lines :: " + insert_query);
						var fields_irl_insert_details = {query:insert_query};
						dbs.query(null,fields_irl_insert_details);
						dbs.update();
						//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
				}
				else
				{
					var update_query = "update item_receipt_lines set item_receipt_id='"+results.itemreceiptdetails[i].ns_id
								+ "',item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
								+ "',quantity_received='" + results.itemreceiptdetails[i].itempush[j].quantity_received
								+ "',item_name='" + results.itemreceiptdetails[i].itempush[j].item_name
								+ "',vendor_prod_name='" + results.itemreceiptdetails[i].itempush[j].vendor_prod_name
								+ "' where item_receipt_id= '" + results.itemreceiptdetails[i].ns_id
								+ "' AND item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
								+ "' AND vendor_ns_id='" + id + "'"; 
					console.log("Query for update query in item_receipt_lines :: " + update_query);
					var fields_irl_update_details = {query:update_query};
					dbs.query(null,fields_irl_update_details);
					dbs.update();
					 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
				}
			} 
		}
	});
	});
		var date_obj=new Date();
	Number.prototype.padLeft = function(base,chr){
    var  len = (String(base || 10).length - String(this).length)+1;
    return len > 0? new Array(len).join(chr || '0')+this : this;
}
	
		var date_obj = new Date,
    current_date = [(date_obj.getMonth()+1).padLeft(),
               date_obj.getDate().padLeft(),
               date_obj.getFullYear()].join('/') +' ' +
              [date_obj.getHours().padLeft(),
               date_obj.getMinutes().padLeft(),
               date_obj.getSeconds().padLeft()].join(':');

		var update_query = "update timestamp set timestamp='" + results.updatetimestamp
					+ "',local_time='" + current_date
					+ "' where rec_type=" + rec_type
					+" AND vendor_ns_id::integer='" + id +"'";
		var fields_bll_timestamp_update = {query:update_query};
		dbs.query(null,fields_bll_timestamp_update);
		dbs.update();
		//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
		//client.end();
	/*var data = db.export();
	var buffer = new Buffer(data);
		console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer);
	*/
	}
	});
		//var contents = db.exec("select timestamp from timestamp where rec_type='"+rec_type+"'");

			});
		
	

//var id=req.query.vendorid;  
var page_title='Item Receipt';
var created_date=new Array();
var purchase_order_ext_id=new Array();
var ns_id=new Array();
//var poid = new Array();
var memo = new Array();
var ns_ext_id = new Array();
var time_stamp='';

//var timestamp_contents = db.exec("select timestamp from timestamp where rec_type= 'Bills'");
//var timestamp_contents = db.exec("select localtime from timestamp where rec_type= 'Bills'");
setTimeout(function(){
	var fields_timestamp_details= {key:"rec_type",operator:"=",value:"'ItemReceipt'",key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	console.log('Before timestamp details :: ');
	dbs.query('timestamp',fields_timestamp_details);
	dbs.readData(function (result){
		if(result.length!=0)
		{
			console.log("result timestamp details :: "+ JSON.stringify(result));
			time_stamp = result[0].timestamp;
			console.log("time_stamp :: "+time_stamp);
		}
		else {
				var vndr={key:"VENDOR_NS_ID::integer",operator:"=",value:id};
				dbs.query('vendor_master',vndr);
				dbs.readData(function (results){
				var dat = dt.timestamp_formatter(results[0].date_created);	
				setTimeout(function () {
				var timestamp_ir = "INSERT INTO timestamp VALUES('ItemReceipt','"
						+ dat + "','"
						+ dat + "','"
						+ results[0].vendor_ns_id + "')" ;
			
				console.log("Insert Query Timestamp IR ::" + timestamp_ir);
				var fields_timestamp_ir_create = {query:timestamp_ir};
				dbs.query(null,fields_timestamp_ir_create);
				dbs.update();
				},3000);
				time_stamp = results[0].date_created;
				console.log("current time_stamp check :: ");
				});
		}
	var fields_item_receipt_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('item_receipt',fields_item_receipt_list_details);
	dbs.readData(function (result){
	console.log("result item receipt list :: "+ JSON.stringify(result));
	
	if(result != null)
	{
		console.log("contents length : " + result.length);
		
		for (var i=0; i<result.length; i++) 
		{
			ns_ext_id[i] = result[i].ns_ext_id
			created_date[i] = dt.date_formatter(result[i].created_date); 
			purchase_order_ext_id[i] = result[i].purchase_order_ext_id;
			ns_id[i] = result[i].ns_id;
			memo[i] = result[i].memo;
			
			
			console.log("created_date "+created_date);
			console.log("purchase_order_ext_id "+purchase_order_ext_id);
			console.log("ns_id "+ns_id);
			console.log("memo "+memo);
			console.log("ns_ext_id " + ns_ext_id);
			

			console.log("*****************************");
		}
	
  res.render('ItemReceipts', { //render the index.ejs
	 
	  tran_id:ns_ext_id,
	  tran_poid:purchase_order_ext_id,
	  tran_date:created_date,
	  tran_ns_id:ns_id,
	  tran_memo:memo,
	  title:page_title,
	  vendorname:vendor_name,
	  v_id:id,
	  notdata_rend:notdata,
	  count_rend:count,
	  time_stamp_val:time_stamp,
	  contentlength:result.length
	  
  });
	}
	else
	{
		res.render('ItemReceipts',{
			 contentlength:0,
			 title:page_title,
			 vendorname:vendor_name,
			 time_stamp_val:time_stamp,
			 notdata_rend:notdata,
	  		 count_rend:count,
			 v_id:id
		});
	}
		});
	});
},3000);
}
else
{
	res.render('signout',{});
}

	
});

/* GET Item Receipt View Page */
app.get('/itemreceiptsview', requireLogin, function(req, res, next) {

if(id)
{
	console.log("Item Receipts View page ");
		
	var item_receipt_ns_id=req.query.ns_id;
	console.log("item_receipt_ns_id  "+item_receipt_ns_id);
	
	var rest_params = {"vendor_id":id,"event":"refresh","itemreceipt_id_ns":item_receipt_ns_id};
	
	function onFailure(err) {
	  process.stderr.write("Refresh Failed: " + err.message + "\n");
	  //process.exit(1);
	}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 

		search.run(rest_params, function (err, results) {
		  if (err) onFailure(err);
		 
		 if(results.status=='Successful')
		 {
			 
		 
		   console.log('results:::'+results);
		  var parsed_response=JSON.stringify(results);
			console.log('parsed_response:::'+parsed_response);
		  var header=results.status;
		  	
		
		   
		  var data_len=results.itemreceiptdetails.length;
		  console.log('data_len:::'+data_len);
				
			console.log('status::'+header);
			console.log('datalength::'+data_len);
			console.log('itemdatalength::'+results.itemreceiptdetails[0].itempush.length);
			console.log("tranID : "+results.itemreceiptdetails[0].tranID);
			console.log("item_id : "+results.itemreceiptdetails[0].itempush[0].item_id);
			console.log("timestamp : "+results.updatetimestamp);
		
			function isItemInArray(array, item) {
		    for (var i = 0; i < array.length; i++) {
		        // This if statement depends on the format of your array
		        if (array[i][0] == item[0] && array[i][1] == item[1]) {
		            return true;   // Found it
		        }
		    }
		    return false;   // Not found
		}
		// create an arry of existing IRs	
			
			var fields_item_receipt_list_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
			dbs.query('item_receipt',fields_item_receipt_list_details);
			var item_receipt_list=new Array(); 
			dbs.readData(function (result){
				
			
				if(result!=null)
				{
					for(var r=0;r<result.length; r++) 
						{
							item_receipt_list[r]=result[r].ns_id;
						}
			
					console.log('item_receipt_list array::'+item_receipt_list);
				}
			
			
			//var bill_contents = client.query("select BILL_LIST_NS_ID from BILL_LIST");
			/*contents.on("end", function (result) {          
			console.log('Purchase Order View');
			client.end();
				
			});
			*/
			//var bill_contents = db.exec("select BILL_LIST_NS_ID from BILL_LIST");
		
		
		
		// create a arry of existing POs	
			//var bill_line_contents = client.query("select BILL_LIST_NS_ID,ITEM_ID from BILL_LIST_LINES");
			
			var fields_item_receipt_lines_details= {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
			dbs.query('item_receipt_lines',fields_item_receipt_lines_details);
			var item_receipt_line_list=new Array();
			dbs.readData(function (result){
		
				 
			
				if(result!=null)
				{
			
					for(var r=0;r<result.length; r++) 
					{
						item_receipt_line_list[r]=new Array();
						item_receipt_line_list[r][0]=result[r].item_receipt_id;
						item_receipt_line_list[r][1]=result[r].item_id;
		
					}
							console.log('item_receipt_line_list array::'+item_receipt_line_list);
				}
		
			
			
				
		// insert or update PO and PO lines
			 for(var i=0;i<results.itemreceiptdetails.length;i++)
			{
				console.log('in i loop::');
				
				var index=item_receipt_list.indexOf(parseInt(results.itemreceiptdetails[i].ns_id));
				console.log('index::'+index);
				
				
				
				if(index<0)
				{
					var insert_query = "insert into item_receipt values('"
								+ results.itemreceiptdetails[i].ns_id + "','"
								+ results.itemreceiptdetails[i].tranID + "','"
								+ results.itemreceiptdetails[i].createddate + "','"
								+ results.itemreceiptdetails[i].po_tranId + "','"
								+ results.itemreceiptdetails[i].po_id + "','"
								+ results.itemreceiptdetails[i].currency + "','"
								+ results.itemreceiptdetails[i].memo + "','"
								+ id + "')";
					var fields_insert_details = {query:insert_query};
					dbs.query(null,fields_insert_details);
					dbs.update();
					
				}
				else
				{
					var update_query= "update item_receipt set ns_id='" + results.itemreceiptdetails[i].ns_id
								+ "',ns_ext_id='" + results.itemreceiptdetails[i].tranID
								+ "',created_date='" + results.itemreceiptdetails[i].createddate
								+ "',purchase_order_ext_id='" + results.itemreceiptdetails[i].po_tranId
								+ "',purchase_order_id='" + results.itemreceiptdetails[i].po_id
								+ "',currency='" + results.itemreceiptdetails[i].currency
								+ "',memo='" + results.itemreceiptdetails[i].memo
								+ "' where ns_id= '" + results.itemreceiptdetails[i].ns_id
								+ "' AND vendor_ns_id='" + id + "'";
					var fields_update_details = {query:update_query};
					dbs.query(null,fields_update_details);
					dbs.update();
				}
				 
				 
					for(var j=0;j<results.itemreceiptdetails[i].itempush.length;j++)
					{
						
						
						
						var neg_factor_qty=1;
							if(results.itemreceiptdetails[i].itempush[j].quantity_received<1)
							{
								neg_factor_qty=-1;
							}
							/*		var neg_factor_amt=1;
							if(results.itemreceiptdetails[i].itempush[j].amount<1)
							{
								neg_factor_amt=-1;
							}
							*/
						console.log('in j loop::'+[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
						
						var is_exist=isItemInArray(item_receipt_line_list,[results.itemreceiptdetails[i].ns_id,results.itemreceiptdetails[i].itempush[j].item_id]);
						
						console.log('is_exist::'+is_exist);
						
						if(!is_exist)
						{
							var insert_query = "insert into item_receipt_lines values('"
										+ results.itemreceiptdetails[i].ns_id + "','"
										+ results.itemreceiptdetails[i].itempush[j].item_id + "','"
										+ results.itemreceiptdetails[i].itempush[j].quantity_received + "','"
										+ results.itemreceiptdetails[i].itempush[j].item_name + "','"
										+ results.itemreceiptdetails[i].itempush[j].vendor_prod_name + "','"
										+ id + "')";
							var fields_irl_insert_details = {query:insert_query};
							dbs.query(null,fields_irl_insert_details);
							dbs.update();
							//db.run("insert into BILL_LIST_LINES('BILL_LIST_NS_ID','ITEM_ID','ITEM_NAME','DESCRIPTION','QUANTITY','tax_amount','amount')  values('"+results.billdetails[i].tranID+"','"+results.billdetails[i].itempush[j].itemID+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemName+"','"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"','"+results.billdetails[i].itempush[j].taxamount+"','"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"')"); 
						}
						else
						{
							var update_query = "update item_receipt_lines set item_receipt_id='"+results.itemreceiptdetails[i].ns_id
										+ "',item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
										+ "',quantity_received='" + results.itemreceiptdetails[i].itempush[j].quantity_received
										+ "',item_name='" + results.itemreceiptdetails[i].itempush[j].item_name
										+ "',vendor_prod_name='" + results.itemreceiptdetails[i].itempush[j].vendor_prod_name
										+ "' where item_receipt_id= '" + results.itemreceiptdetails[i].ns_id
										+ "' AND item_id='" + results.itemreceiptdetails[i].itempush[j].item_id
										+ "' AND vendor_ns_id='" + id + "'"; 
							var fields_irl_update_details = {query:update_query};
							dbs.query(null,fields_irl_update_details);
							dbs.update();
							 //db.run("update BILL_LIST_LINES set BILL_LIST_NS_ID='"+results.billdetails[i].tranID+"',ITEM_ID='"+results.billdetails[i].itempush[j].itemID+"',QUANTITY='"+results.billdetails[i].itempush[j].itemQty*neg_factor_qty+"',ITEM_NAME='"+results.billdetails[i].itempush[j].itemName+"',DESCRIPTION='"+results.billdetails[i].itempush[j].itemName+"',amount='"+results.billdetails[i].itempush[j].amount*neg_factor_amt+"',tax_amount='"+results.billdetails[i].itempush[j].taxamount+"' where BILL_LIST_NS_ID= '"+results.billdetails[i].tranID+"' AND item_id='"+results.billdetails[i].itempush[j].itemID+"'");  
						}
					} 
				}
			});
			});
			/*	var date_obj=new Date();
			Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
			
				var date_obj = new Date,
		    current_date = [(date_obj.getMonth()+1).padLeft(),
		               date_obj.getDate().padLeft(),
		               date_obj.getFullYear()].join('/') +' ' +
		              [date_obj.getHours().padLeft(),
		               date_obj.getMinutes().padLeft(),
		               date_obj.getSeconds().padLeft()].join(':');
		
				var update_query = "update timestamp set timestamp='" + results.updatetimestamp
							+ "',local_time='" + current_date
							+ "' where rec_type=" + rec_type
							+" AND vendor_ns_id::integer='" + id +"'";
				var fields_irl_timestamp_update = {query:update_query};
				dbs.query(null,fields_irl_timestamp_update);
				dbs.update();
			*/
				//db.run("update timestamp set timestamp='"+results.updatetimestamp+"',localtime='"+current_date+"' where rec_type='"+rec_type+"'");
				//client.end();
			/*var data = db.export();
			var buffer = new Buffer(data);
				console.log('fs::'+fs);
			fs.writeFileSync("supplier_master.db", buffer);
			*/
			}
			});
		
		
		var poid ; 
		item_receipt_ns_id=req.query.ns_id;
		console.log("item_receipt_ns_id  "+item_receipt_ns_id);

		/*var contents = client.query("select * from bill_list where BILL_LIST_NS_ID = "+bill_ns_id);
		contents.on("end", function (result) {          
		console.log('Purchase Order View');
		client.end();
			
		});
		*/
		//var contents = db.exec("select * from bill_list where BILL_LIST_NS_ID = "+bill_ns_id);
		setTimeout(function(){
		var fields_item_receipt_details= {key:"ns_id",operator:"=",value:item_receipt_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('item_receipt',fields_item_receipt_details);
		dbs.readData(function (result1){
			console.log("result item_receipt_ns details :: "+ JSON.stringify(result1));
			console.log("contents length : "+result1.length);
			for (var i=0; i<result1.length; i++) 
			{
			ns_ext_id_val = result1[i].ns_ext_id;
			created_date_val = dt.date_formatter(result1[i].created_date); 
			memo_val = result1[i].memo;
			currency_val = result1[i].currency;
			poid = result1[i].purchase_order_ext_id;
			} 
		
		/*
		var bill_line_contents = client.query("select * from BILL_LIST_LINES where BILL_LIST_NS_ID = "+bill_ns_id);
		bill_line_contents.on("end", function (result) {          
		console.log('Purchase Order View');
		client.end();
			
		});
		*/
		//var bill_line_contents = db.exec("select * from BILL_LIST_LINES where BILL_LIST_NS_ID = "+bill_ns_id);
		
		var fields_item_receipt_line_contents= {key:"item_receipt_id",operator:"=",value:item_receipt_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('item_receipt_lines',fields_item_receipt_line_contents);
		dbs.readData(function (result){
			console.log("result Item_receipt details :: "+ JSON.stringify(result));
			console.log("contents length : "+result.length);
			
		
			if(result!=null)
			{
				console.log("item_receipt_lines_contents length : "+result.length);
				var items_data = new Array();
			
				for (var i=0; i<result.length; i++) 
				{
				var item = new Object();
				
				item.item_id_val= result[i].item_id;
				console.log("item.item_id_val  "+item.item_id_val);
				
				item.item_name_val = result[i].item_name; 
				item.item_receipt_id_val = result[i].item_receipt_id;
				item.quantity_val = result[i].quantity_received;
				item.vendor_prod_name_val = result[i].vendor_prod_name; 
				items_data.push(item);
				
				}  
			
			
			
			console.log("items_data "+items_data);
			console.log("items_data "+JSON.stringify(items_data));
			
			res.render('ItemReceiptsView', { //render the index.ejs
		 
		  v_id:id,
		  notdata_rend:notdata,
	  	  count_rend:count,
		  vendorname:vendor_name,
		  item_receipt_id:ns_ext_id_val,
		  trandate:created_date_val,
		  po_id:poid,
		  items:items_data,
		  item_receipt_ns_id:item_receipt_ns_id,
		  tran_currency:currency_val,
		  tran_memo:memo_val,
		  line_length:result.length
			});
			}		
		else
		{
			res.render('ItemReceiptsView', { //render the index.ejs
		 
		  v_id:id,
		  notdata_rend:notdata,
	  	  count_rend:count,
		  vendorname:vendor_name,
		  item_receipt_id:ns_ext_id_val,
		  item_receipt_ns_id:item_receipt_ns_id,
		  trandate:created_date_val,
		  line_length:0
		
		  
	  });
		}
		});
			
		});	
		},3000);
}
else
{
	res.render('signout',{});
}	// route for '/'

});


/*GET packing list status view page. */
app.get('/packingliststatusview', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
		console.log(" packinglist_statusview page ");
		

	pl_status=req.query.status;
	console.log("status  "+pl_status)
	title_val = "PackingList "+pl_status;
	
	
	var pl_line_contents=null;
	if(pl_status=='allPL')
	{
		console.log("status is all orders");
		
		var fields_packing_list_details = {key:"VENDOR_NS_ID::integer",operator:"=",value:id}
		dbs.query('packing_list',fields_packing_list_details);
		dbs.readData(function (result){
		console.log("result packing list  details with status all pl :: "+ JSON.stringify(result));
		pl_line_contents=result;
		if(pl_line_contents!=null)
		{
		
	
		var pl_list_array =new Array();
	
		for (var i=0; i<pl_line_contents.length; i++) 
		{
			 var pl_data = new Object();
			 pl_data.packing_list_num = pl_line_contents[i].packing_list_num;
			 pl_data.date_created = dt.date_formatter(pl_line_contents[i].date_created); 
			 pl_data.po_num = pl_line_contents[i].po_num;
			 pl_data.status = pl_line_contents[i].status;
			 pl_data.memo = pl_line_contents[i].memo;
			 pl_data.packing_list_ns_id = pl_line_contents[i].packing_list_ns_id;
		
			 pl_list_array.push(pl_data);
		// console.log("pl_list_array "+pl_list_array);
		} 
	
	 res.render('packingliststatusview', { //render the index.ejs
		 v_id:id,
		 notdata_rend:notdata,
	  	 count_rend:count,
		 vendorname:vendor_name,
		 title:title_val,
		 pl_list:pl_list_array,
		 content_length:pl_line_contents.length
	 });
	}
	else
	{
		
		res.render('packingliststatusview', { //render the index.ejs
		 v_id:id,
		 notdata_rend:notdata,
	  	 count_rend:count,
		 vendorname:vendor_name,
		 title:title_val,
		 content_length:0
  		});
	}
		
		
		});

	}
	else
	{
		var pl_status_quotes = "'" + pl_status + "'";
		var fields_plstatus_details= {key:"STATUS",operator:"=",value:pl_status_quotes,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('packing_list',fields_plstatus_details);
		dbs.readData(function (result){
		console.log("result packing list details :: "+ JSON.stringify(result));
		pl_line_contents=result;
		
			if(pl_line_contents!=null)
	{
		
	
	var pl_list_array =new Array();
	
	for (var i=0; i<pl_line_contents.length; i++) 
	{
		 var pl_data = new Object();
		 pl_data.packing_list_num = pl_line_contents[i].packing_list_num;
		 pl_data.date_created = dt.date_formatter(pl_line_contents[i].date_created); 
		 pl_data.po_num = pl_line_contents[i].po_num;
		 pl_data.status = pl_line_contents[i].status;
		 pl_data.memo = pl_line_contents[i].memo;
		 pl_data.packing_list_ns_id = pl_line_contents[i].packing_list_ns_id;
		
		
		 pl_list_array.push(pl_data);
		// console.log("pl_list_array "+pl_list_array);
	} 
	
  res.render('packingliststatusview', { //render the index.ejs
	 v_id:id,
	 notdata_rend:notdata,
	 count_rend:count,
	 vendorname:vendor_name,
	 title:title_val,
	 pl_list:pl_list_array,
	 content_length:pl_line_contents.length
  });
	}
	else
	{
		
	res.render('packingliststatusview', { //render the index.ejs
	 v_id:id,
	 notdata_rend:notdata,
	 count_rend:count,
	 vendorname:vendor_name,
	 title:title_val,
	 content_length:0
  });
	}
			
		});
		//pl_line_contents = db.exec("select packing_list_num,DATE_CREATED,po_num,STATUS,MEMO from packing_list where STATUS ='"+pl_status+"'");

	}
	
}
else
{
	res.render('signout',{});
}


	
});

/*GET create PO Packing list page. */
app.get('/packinglistcreate', requireLogin, function(req, res, next) { // route for '/'

if(id)
{
		console.log("create PO_packing list ");
	var ponum_val=new Array();
	var ship_to_val=new Array();
	var delivery_method_val=new Array();
	var shipping_point_val = new Array();
	var shipment_origin_val = new Array();
	var qty_di = new Array();
	po_ns_id=req.query.po_ns_id;
	console.log("po_ns_id  "+po_ns_id);
	/*
	var fields_vendor_preferences = {key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('vendor_master',fields_vendor_preferences);
	dbs.readData(function(result){
		if(result.length!=0)
		{
			shipment_origin_val = result[0].shipment_origin;
			console.log("shipment_origin_val --> "+ shipment_origin_val );
		}
	});
	*/
	var fields_po_packing_list_details= {key:"PO_NS_ID",operator:"=",value:po_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_po_packing_list_details);
	dbs.readData(function (result){
		console.log("contents length : "+result.length);
		for (var i=0; i<result.length; i++) 
		{
			ponum_val = result[i].po_number;
			console.log("PO num val --> "  + ponum_val);
			ship_to_val = result[i].ship_to;
			console.log("Ship To -->"  + ship_to_val);
			delivery_method_val = result[i].delivery_method;
			console.log("Delivery_method Val --> " + delivery_method_val);
			shipping_point_val = result[i].shipping_point;
			console.log("Shipping_point_val -->" + shipping_point_val);
			shipment_origin_val = result[i].shipment_origin;
			console.log("shipment_origin_val --> "+ shipment_origin_val );
		}
		
		
//var contents = db.exec("select PO_NUMBER,SHIP_TO,DELIVERY_METHOD from purchase_order where PO_NS_ID = "+po_ns_id);
	
		
	
		 
		//var po_line_contents ="select ITEM_ID,ITEM_NAME,PO_NS_ID,DESCRIPTION,QTY from po_lines where PO_NS_ID = "+po_ns_id);
		
		var fields_po_line_details= {key:"PO_NS_ID",operator:"=",value:po_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};	
		dbs.query('po_lines',fields_po_line_details);
		dbs.readData(function (result1){
			if(result1.length!=0)
			{
				console.log("po_line_contents length : "+result1.length);
				var items_data = new Array();
				
				var count1 = 0;
				async.whilst(
				    function() { 
				    	console.log("Count --> " + count1);
				    	console.log("Result1.length --> " + result1.length );
				    	return count1 < result1.length; },
				    function(callback) {
				       
				        console.log("item.item_id_val  "+result1[count1].item_id);
					var itemidval = "'" +result1[count1].item_id + "'";
					var item = new Object();
				
					var qty_dispt = 0;
					
					item.item_id_val= result1[count1].item_id;
					item.item_name_val = result1[count1].item_name; 
					item.po_ns_id_val = result1[count1].po_ns_id;
					description_val = result1[count1].description;
					description_val = description_val.replace(/(\r\n|\n|\r)/gm,"");
					if(description_val=='null')
					{
						item.description_val='';
					}
					else
					{
						item.description_val = description_val ;
					}
					item.quantity_val = result1[count1].qty;
					var fields_pl_lines = {key:"PO_NS_ID",operator:"=",value:po_ns_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id,key2:"ITEM_ID",operator2:"=",value2:itemidval}
					dbs.query('packing_list_lines',fields_pl_lines);
					dbs.readData(function (result2){
						if(result2.length!=0)
						{
							console.log(" pl_lines length" + result2.length);
							qty_dispt = 0 ;
							for (var j=0; j<result2.length; j++) 
							{
								qty_dispt += result2[j].qty_dispatched;
							}
							console.log(" item qty_dispt"+ qty_dispt);
							
							item.disp_qty = qty_dispt;
							items_data.push(item);
							/*
							if(item.disp_qty < item.quantity_val)
							{
								items_data.push(item);
								//console.log(" data pushed in item list "+ i + " Item inserted if PL already exists " +JSON.stringify(items_data));
							}
							*/
						}
						else
						{
							qty_dispt = 0;
							console.log("Qty dispatched if 0" + qty_dispt);
							item.disp_qty = qty_dispt;
							items_data.push(item);
						}
					});
					 count1++;
				        console.log("Count inside function --> " + count1);
					callback(null, count1);
				    },
				    function (err, n) {
				        // 5 seconds have passed, n = 5
				    }
				);
				
			//	for (var i=0; i<result1.length; i++) 
			//	{
				
					//var pl_lines = client.query("select QTY_DISPATCHED from packing_list_lines where PO_NS_ID = '"+po_ns_id+"' AND ITEM_ID='"+item.item_id_val+"'");
					//console.log(" data pushed in item list "+ i + " Item inserted if PL doesn't exists " +JSON.stringify(items_data));
			//	}
				setTimeout(function(){
				console.log("items_data "+items_data);
				//items_data.push(item);
				console.log("items_data Json Format --> " + JSON.stringify(items_data));
				res.render('packinglistcreate', { //render the index.ejs
				v_id:id,
				notdata_rend:notdata,
	  			count_rend:count,
				vendorname:vendor_name,
				po_num:ponum_val,
				po_nsid:po_ns_id,
				ship_to:ship_to_val,
				shipping_point:shipping_point_val, 
				delivery_method:delivery_method_val,
				shipment_origin:shipment_origin_val,	
				items:items_data,
				content_lenth:result1.length
			  	});
					
				},5000);
			}
			else	
			{
			  res.render('packinglistcreate', { //render the index.ejs
			  v_id:id,
			  notdata_rend:notdata,
	  		  count_rend:count,
			  vendorname:vendor_name,
			  po_num:ponum_val,
			  po_nsid:po_ns_id,
			  ship_to:ship_to_val,
			  delivery_method:delivery_method_val,
			  shipping_point:shipping_point_val,
			  shipment_origin:shipment_origin_val,	  
			  content_lenth:0
			   });
			}
			});	
	});
	
}
else
{
	res.render('signout',{});
}

});

/*POST po packing list create page. */
app.post('/packinglistcreate',function(req,res){
	
if(id)
{
	
	console.log('post of po_packinglistcreate');
	var max_id=1;
	var rc = req.body.rowcount;
	if(req.body.date_created==''||req.body.date_created==null)
	{
		var date_created = null;
		console.log("If date is null --> " + date_created);
	}
	else
	{
		var date_created = "'" + req.body.date_created + "'";
		console.log("If date is not null --> " +  date_created);
	}
	if(req.body.shipdate==''||req.body.shipdate==null)
	{
		var shipdate = null;
	}
	else
	{
		var shipdate = "'" + req.body.shipdate + "'";
	}
	var shipto = req.body.shipto;
	console.log("Ship To Val --> " + shipto);
	
	var deliverymethod = req.body.deliverymethod;
	console.log("Delivery Method Val --> " + deliverymethod);
	
	var shipmentorigin = req.body.shipmentorigin;
	console.log("Shipment Origin Val --> " + shipmentorigin);
	
	var shipmentpoint = req.body.shipmentpoint;
	console.log("Shipment Point Val--> " + shipmentpoint);
	
	var po_num = req.body.po_num;
	console.log("PO Num Val--> " + po_num);
	
	var memo = req.body.memo;
	console.log(" Memo Val --> " + memo);
	
	var po_ns_idval = req.body.po_ns_idval;
	console.log("PO NS Id val --> " + po_ns_idval);
	
	

	/*
	pl_lines.on("end", function (result) {          
	console.log('Purchase Order View');
	client.end();
	});
	*/
	//db.run("insert into packing_list('SHIP_TO','SHIP_DATE','DELIVERY_METHOD','SHIPMENT_ORIGIN','SHIPMENT_POINT','STATUS','packing_list_num','po_num','DATE_CREATED','MEMO','po_ns_id') values('"+req.body.shipto+"','"+req.body.shipdate+"','"+req.body.deliverymethod+"','"+req.body.shipmentorigin+"','"+req.body.shipmentpoint+"', 'Ready to Ship','PL"+req.body.po_num+"','"+req.body.po_num+"','"+req.body.date_created+"','"+req.body.memo+"','"+req.body.po_ns_idval+"')");
	//var max_id_content = db.exec("SELECT MAX(id) FROM packing_list");
	
	//var max_id_content = client.query("SELECT MAX(id) FROM packing_list");
	
	var fields_packing_list_details= {inoperator:"MAX(id)",key:"VENDOR_NS_ID::integer",operator:"=",value:id};
	dbs.query('packing_list',fields_packing_list_details);
	dbs.readData(function (result){
		if(result[0].max!=null)
		{
			console.log("result max_id ::" + JSON.stringify(result));
			max_id = result[0].max+1;
		}	
		
		/*
		var insert_query = "insert into packing_list (SHIP_TO,SHIP_DATE,id,DELIVERY_METHOD,SHIPMENT_ORIGIN,SHIPMENT_POINT,STATUS,packing_list_num,po_num,DATE_CREATED,MEMO,po_ns_id,vendor_ns_id) values('"
					+ req.body.shipto + "','"
					+ req.body.shipdate + "',"
					+ max_id + ",'"
					+ req.body.deliverymethod + "','"
					+ req.body.shipmentorigin + "','"
					+ req.body.shipmentpoint + "', 'Ready to Ship','PL0"
					+ max_id + "','"
					+ req.body.po_num + "','"
					+ req.body.date_created + "','"
					+ req.body.memo + "','"
					+ req.body.po_ns_idval + "','"
					+ id +"')";
		*/
		console.log("Ship to -->" + req.body.shipto);
		console.log("Ship Date -->" + req.body.shipdate);
		console.log("Delivery Method--> "+ req.body.deliverymethod);
		console.log("Shipment Origin -->" + req.body.shipmentorigin);
		console.log("memo -->" + req.body.memo );
		console.log('Checkbox before pl value==>'+req.body['check_remove' + 0]);
		console.log("Date created in Packing list Post -->  " + req.body.date_created);
		
		
		
		
		
		
		var insert_pl_query = "insert into packing_list values(NULL,'"
					+ shipto + "',"
					+ shipdate + ",'"
					+ deliverymethod + "','"
					+ shipmentorigin + "','"
					+ shipmentpoint + "','Ready to Ship','','PL0"
					+ max_id + "','"
					+ po_num + "',"
					+ date_created + ",'"
					+ memo + "','"
					+ po_ns_idval + "','"
					+ max_id + "','"
					+ id +"')";
		//console.log("Query for insert in PL Create " + insert_query);		
		console.log("Insert Query Packing list ::" + insert_pl_query);
		var fields_pl_create = {query:insert_pl_query};
		console.log("Packing List --> " + fields_pl_create + "JSON" + JSON.stringify(fields_pl_create));
		dbs.query(null,fields_pl_create);
		dbs.update();
		console.log('max_id_content value::'+max_id);
	
		/*	var update_query = "update packing_list set packing_list_num='PL0" + max_id
						+"' where id= " + max_id
						+" AND vendor_ns_id ='" + id
						+"'";
			var fields_update = {query:update_query}
			dbs.query(null,fields_update);
			dbs.update();
		*/
	
	/*if(max_id_content!='')
	{
		max_id = max_id_content[0]["values"][0][0];
		console.log('max_id_content value::'+max_id);
		client.query("update packing_list set packing_list_num='PL0"+max_id+"' where id= "+max_id); 
		//db.run("update packing_list set packing_list_num='PL0"+max_id+"' where id= "+max_id); 		
	}
	*/
	console.log("Rowcount ::" + rc);
	//setTimeout(function(){
	
	for(var i=0;i<rc-2;i++)
	{
		itemName = req.body['itemname' + i];
		console.log('item name==>'+itemName);
		console.log('item ID==>'+req.body['itemid' + i]);
		console.log('desc==>'+req.body['description' + i]);
		console.log('qty==>'+req.body['quantity' + i]);
		console.log('dispatched==>'+req.body['quantitydispatched' + i]);
		console.log('po_num==>'+req.body['po_num' + i]);
		console.log('net wt==>'+req.body['netweight' + i]);
		console.log('gross wt==>'+req.body['grossweight' + i]);
		console.log('Checkbox value==>'+req.body['check_remove' + i]);
		
		if(req.body['netweight' + i]==''||req.body['netweight' + i]==null)
		{
			var netweight = 0;
		}
		else
		{
			var netweight = req.body['netweight' + i];
		}
		if(req.body['grossweight' + i] == '' || req.body['grossweight' + i] == null)
		{
			var grossweight = 0;
		}
		else
		{
			var grossweight = req.body['grossweight' + i]
		}
		if(req.body['check_remove' + i]=='on')
		{
		
			var insert_pl_query = "insert into packing_list_lines values(NULL,'"
						+ req.body['itemid' + i] + "','"
						+ req.body['itemname' + i] + "','"
						+ req.body['description' + i] + "','"
						+ req.body['quantity' + i] + "','"
						+ req.body['quantitydispatched' + i] + "','"
						+ req.body.po_ns_idval + "','"
						+ netweight + "','"
						+ grossweight + "','PL0" + max_id + "','"
						+ req.body['po_num' + i] + "','"
						+ id + "')";
			console.log("Insert Packing List Lines :: " + insert_pl_query);
			var fields_insert_pl = {query:insert_pl_query};
			dbs.query(null,fields_insert_pl);
			dbs.update();
		}//db.run("insert into packing_list_lines('ITEM_ID','ITEM_NAME','DESCRIPTION','QTY_ORDERED','QTY_DISPATCHED','NET_WT','GROSS_WT','packinglist_ref','REF_PO_NUM','PO_NS_ID') values('"+req.body['itemid' + i]+"','"+req.body['itemname' + i]+"','"+req.body['description' + i]+"','"+req.body['quantity' + i]+"','"+req.body['quantitydispatched' + i]+"','"+req.body['netweight' + i]+"','"+req.body['grossweight' + i]+"','PL0"+max_id+"','"+req.body['po_num' + i]+"','"+req.body.po_ns_idval+"')");
	}
	
	
	});

	/*
	var data = db.export();
	var buffer = new Buffer(data);
	console.log('fs::'+fs);
	fs.writeFileSync("supplier_master.db", buffer); 
	*/
	setTimeout(function () {
	res.redirect(303,'/packinglistview?pl_number=PL0'+max_id+'&notdata[]='+notdata+'&count='+count)
	},5000);
}
else
{
	res.render('signout',{});
}
	
}); 

/*GET Packing list View page. */
app.get('/packinglistview', requireLogin, function(req, res, next) { 

if(id)
{
	console.log("Packing list View page ");
	console.log("packing list number  "+req.query.pl_number);
	
	var packinglist_num=req.query.pl_number; 
	var plnum = "'" + packinglist_num + "'";
	var fields_pl_contents= {key:"packing_list_num",operator:"=",value:plnum,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_pl_contents);
	dbs.readData(function (result){
	
	console.log("pl_contents length : "+result.length);
	
	for (var i=0; i<result.length; i++) 
	{
		ship_to_val = result[i].ship_to;
		ship_date_val = dt.date_formatter(result[i].ship_date); 
		delivery_method_val = result[i].delivery_method;
		ship_origin_val = result[i].shipment_origin;
		shipment_point_val = result[i].shipment_point;
		pl_num_val = result[i].packing_list_num;
		memo_val = result[i].memo;
		status_val = result[i].status;
		console.log("packing list status_val  "+status_val);
	} 
		
	
	/*
	//var pl_contents = "select SHIP_TO,SHIP_DATE,DELIVERY_METHOD,SHIPMENT_ORIGIN,SHIPMENT_POINT,packing_list_num,MEMO, STATUS from packing_list where packing_list_num='"+packinglist_num+"'");
	console.log("pl_contents length : "+pl_contents[0]["values"].length);
	
	for (var i=0; i<pl_contents[0]["values"].length; i++) 
	{
		ship_to_val = pl_contents[0]["values"][i][0];
		ship_date_val = pl_contents[0]["values"][i][1]; 
		delivery_method_val = pl_contents[0]["values"][i][2];
		ship_origin_val = pl_contents[0]["values"][i][3];
		shipment_point_val = pl_contents[0]["values"][i][4];
		pl_num_val = pl_contents[0]["values"][i][5];
		memo_val = pl_contents[0]["values"][i][6];
		status_val = pl_contents[0]["values"][i][7];
		console.log("packing list status_val  "+status_val);
	} 
	//"select ITEM_NAME,DESCRIPTION,QTY_ORDERED,QTY_DISPATCHED,NET_WT,GROSS_WT,REF_PO_NUM from packing_list_lines where packinglist_ref ='"+packinglist_num+"'");
	*/
	var fields_pl_line_contents = {key:"packinglist_ref",operator:"=",value:plnum,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list_lines',fields_pl_line_contents);
	dbs.readData(function (result1){
	
	if(result1 !=null)
	{
		
		console.log("pl_line_contents length : "+result1.length);
		var pl_items_data = new Array();
		
		for (var i=0; i<result1.length; i++) 
		{
			var item = new Object();
				
			item.item_name= result1[i].item_name;
			var item_desc = result1[i].description;
			if(item_desc == 'null')
			{
				item.item_desc = ' '; 
			}
			else
			{
				item.item_desc = item_desc; 
			}
			item.quantity = result1[i].qty_ordered;
			item.dispatched_qty = result1[i].qty_dispatched;
			item.net_wt = result1[i].net_wt;
			item.gross_wt = result1[i].gross_wt;
			item.po_ref_num = result1[i].ref_po_num;
				
			pl_items_data.push(item);
			
		}  
		
		console.log("pl_items_data "+pl_items_data);
		//console.log("pl_items_data "+JSON.stringify(pl_items_data));
	
		res.render('packinglistview', { //render the index.ejs	 
		  v_id:id,
		  notdata_rend:notdata,
	  	  count_rend:count,
		  vendorname:vendor_name,
		  ship_to:ship_to_val,
		  ship_date:ship_date_val,
		  delivery_method:delivery_method_val,
		  ship_origin:ship_origin_val,
		  shipment_point:shipment_point_val,
		  pl_num:pl_num_val,
		  memo:memo_val,
		  pl_status:status_val,
		  pl_items:pl_items_data,
		  pl_items_length:pl_items_data.length
		  
		});
	}
	else
	{
		res.render('packinglistview', { //render the index.ejs	 
		  v_id:id,
		  notdata_rend:notdata,
	  	  count_rend:count,
		  vendorname:vendor_name,
		  ship_to:ship_to_val,
		  ship_date:ship_date_val,
		  delivery_method:delivery_method_val,
		  ship_origin:ship_origin_val,
		  shipment_point:shipment_point_val,
		  pl_num:pl_num_val,
		  memo:memo_val,
		  pl_status:status_val,
		  pl_items_length:0
		  
		});
	}
	});
});
	
}
else
{
	res.render('signout',{});
}
	
});

/*GET edit PO Packing list page. */
app.get('/packinglistedit', requireLogin, function(req, res, next) { 

if(id)
{
	var ship_to_val = new Array();
	var ship_to_date_val = new Array();
	var delivery_method_val = new Array();
	var shipment_origin_val = new Array();
	var shipment_point_val = new Array();
	var memo_val = new Array();
	console.log("***** GET EDIT PACKING LIST START ****** ");
	
	packinglist_num = req.query.pl_num;
	console.log("packinglist_num  "+packinglist_num);
	plnum  = "'" + packinglist_num + "'";
	
	var fields_pl_contents= {key:"packing_list_num",operator:"=",value:plnum,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_pl_contents);
	dbs.readData(function (result2){
	console.log("contents length : "+result2.length);
	
	for (var i=0; i<result2.length; i++) 
	{
			
		ship_to_val = result2[i].ship_to;
		ship_to_date_val = dt.date_formatter(result2[i].ship_date);
		delivery_method_val = result2[i].delivery_method;
		shipment_origin_val = result2[i].shipment_origin;
		shipment_point_val = result2[i].shipment_point;		
		memo_val = result2[i].memo;				
			
	} 
	
	

	var fields_pl_line_contents = {key:"packinglist_ref",operator:"=",value:plnum,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list_lines',fields_pl_line_contents);
	dbs.readData(function (result){
		
		if(result!=null)
	{
		console.log("po_line_contents length : " + result.length);
		
		var items_data = new Array();
			
		for (var i=0; i<result.length; i++) 
		{
			var item = new Object();
			var qty_dispt=0;
					
			item.item_id_val = result[i].item_id;
			item.item_name_val = result[i].item_name; 
			var description_val = result[i].description;
			if(description_val == 'null')
			{
				item.description_val = ' ';
			}
			else
			{
				item.description_val = description_val;
			}
			item.qty_ordered_val = result[i].qty_ordered;
			item.qty_dispatched_val = result[i].qty_dispatched;
			item.netwt_val = result[i].net_wt;
			item.grosswt_val = result[i].gross_wt;
			item.po_ref = result[i].ref_po_num;
			poref= "'" + item.po_ref + "'" ;
			itemid_val = "'" + item.item_id_val + "'" ; 
			var fields_pl_lines = {key:"REF_PO_NUM",operator:"=",value:poref,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id,key2:"ITEM_ID",operator2:"=",value2:itemid_val};
			dbs.query('packing_list_lines',fields_pl_lines);
			dbs.readData(function (result1){
				if(result1!=null)
				{
					console.log(" pl_lines length"+result1.length);
					for (var j=0; j<result1.length; j++) 
					{
						qty_dispt += result1[j].qty_dispatched;
					}
					console.log(" item qty_dispt"+qty_dispt);
	            		}
			});
			//var pl_lines = db.exec("select QTY_DISPATCHED from packing_list_lines where REF_PO_NUM = '"+item.po_ref+"' AND ITEM_ID='"+item.item_id_val+"'");
            		//if(pl_lines!='')
            
            		item.disp_qty = qty_dispt;
			
			items_data.push(item);
				
		}  
			
		//console.log("items_data "+items_data);
		//console.log("items_data "+JSON.stringify(items_data));
		
		res.render('packinglistedit', { //render the index.ejs
		v_id:id,
		notdata_rend:notdata,
	  	count_rend:count,
		vendorname:vendor_name,
		memo:memo_val,
		pl_number:packinglist_num,
		ship_to:ship_to_val,
		ship_to_date:ship_to_date_val,
		delivery_method:delivery_method_val,
		shipment_origin:shipment_origin_val,
		shipment_point:shipment_point_val,
		items:items_data,
		pl_item_count:items_data.length
	  });
  
	}
	else
	{
		res.render('packinglistedit', { //render the index.ejs
		v_id:id,
		notdata_rend:notdata,
	  	count_rend:count,
		vendorname:vendor_name,
		memo:memo_val,
		pl_number:packinglist_num,
		ship_to:ship_to_val,
		ship_to_date:ship_to_date_val,
		delivery_method:delivery_method_val,
		shipment_origin:shipment_origin_val,
		shipment_point:shipment_point_val,
		items:{},
		pl_item_count:0
			
	  });
	}

	
	});

	});	
  console.log("***** GET EDIT PACKING LIST END ****** ");
}
else
{
	res.render('signout',{});
}

  
});

/*POST po packing list edit page. */
app.post('/packinglistedit',function(req,res){
	
if(id)
{
		console.log("***** POST EDIT PACKING LIST START ****** ");
	
	console.log('post of po_packinglist edit');
	console.log('PL number==>'+req.body.pl_number);
	console.log('shipdate==>'+req.body.shipdate);
	console.log('rowcount==>'+req.body.rowcount);

	var update_pl_query = "update packing_list set SHIP_DATE ='" + req.body.shipdate
				+ "' where packing_list_num='" + req.body.pl_number 
				+ "' AND VENDOR_NS_ID::integer='" + id
				+ "'";
	console.log("Update PL query : " + update_pl_query);
	var fields_update_pl= {query:update_pl_query};
	dbs.query('packing_list',fields_update_pl);
	dbs.update();
	
	if(req.body.rowcount>0)
	{
		for(var i=0;i<req.body.rowcount-2;i++)
		{
		console.log('item ID==>'+req.body['itemid' + i]);
		console.log('dispatched==>'+req.body['quantitydispatched' + i]);
		console.log('net wt==>'+req.body['netweight' + i]);
		console.log('gross wt==>'+req.body['grossweight' + i]);
		
		var update_pl_lines_query = "update packing_list_lines set QTY_DISPATCHED ='" + req.body['quantitydispatched' + i]
						+ "',NET_WT='" + req.body['netweight' + i]
						+ "',GROSS_WT='" + req.body['grossweight' + i]
						+ "' where packinglist_ref='" + req.body.pl_number
						+ "' AND ITEM_ID='" + req.body['itemid' + i]
						+ "' AND VENDOR_NS_ID::integer='" + id
						+"'";
		console.log("Update PLL query : " + update_pl_lines_query);
		var fields_update_pll= {query:update_pl_lines_query};
		dbs.query(null,fields_update_pll);
		dbs.update();
		//db.run("update packing_list_lines set('QTY_DISPATCHED','NET_WT','GROSS_WT') values('"+req.body['quantitydispatched' + i]+"','"+req.body['netwt' + i]+"','"+req.body['grosswt' + i]+"') where packinglist_ref='"+req.body.pl_number+"' AND ITEM_ID='"+req.body['itemid' + i]+"'");
		}
	}
	

	res.redirect(303,'/packinglistview?pl_number='+req.body.pl_number+'&notdata[]='+notdata+'&count='+count);
	
	console.log("***** POST EDIT PACKING LIST END ****** ");
}
else
{
	res.render('signout',{});
}
	
}); 

/*GET PL Item remove page. */
app.get('/removeplitem', requireLogin, function(req, res, next) { // route for '/'

	console.log("Remove PL Item page ");

	console.log("pl_num  "+req.query.pl_name);
	console.log("item_id  "+req.query.item_id);

	var delete_query = "delete from packing_list_lines where packinglist_ref= '"+req.query.pl_name
			+ "' AND item_id='" + req.query.item_id
			+ "' AND vendor_ns_id='" + id
			+"'";
	var fields_delete_query = {query:delete_query};		
	dbs.query(null,fields_delete_query);
	dbs.update();
   res.redirect(303,'/packinglistedit?pl_num='+req.query.pl_name+'&notdata[]='+notdata+'&count='+count);
});

/*GET PL publish page. */
app.get('/publishpl', requireLogin, function(req, res, next) {
	
if(id)
{
	
	console.log("Publishing of Packing list started......");
	
	var pl_num = req.query.pl_name;
	
	var pll_num = "'" + pl_num + "'";
	
	console.log("pl_num  "+pl_num);
	
	//var pl_po_id = req.query.po_ns_id;
	//console.log("pl_po_id  "+pl_po_id);
	
	//RecordType.rec_type=req.query.record_type;
	var rec_type = 'PackingList';//req.query.record_type;
	module.exports.rec_type = rec_type;

	console.log("rec_type  "+rec_type);

	var packingList = new Object();
	var fields_publish_pl= {key:"packing_list_num",operator:"=",value:pll_num,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_publish_pl);
	dbs.readData(function (result){
		console.log("result po_publish_pl :: "+ result.length);
		for (var i=0; i<result.length; i++) 
		{
				
			ship_to_val = result[i].ship_to;
			ship_date_val = dt.netsuite_date_formatter(result[i].ship_date);
			delivery_method_val = result[i].delivery_method;
			shipment_origin_val = result[i].shipment_origin;
			pl_po_id = result[i].po_ns_id;	
			status_val = 'Shipped';	
			pl_num_val = result[i].packing_list_num;	
			pl_date_created_val = result[i].date_created;
			
			datetime = new Date(pl_date_created_val);
			day = datetime.getDate();
			day = (day < 10 ? "0" : "") + day;
			month = datetime.getMonth() + 1; //month: 0-11
			month = (month < 10 ? "0" : "") + month;
			year = datetime.getFullYear();
			date =  day + "/" + month + "/" + year;
			console.log("Date : " + date);
			pl_date_created_val = date;
			/*var tempd = pl_date_created_val.split('T');
			console.log("temporary datet"+tempd);
			console.log("temp " + tempd[0]);
			*/
			memo_val = result[i].memo;	
			shipment_pt_val = result[i].shipment_point;	
							
			console.log("ship_to_val  "+ship_to_val);
			
		} 
		packingList.event = 'create';
		//packingList.vendorid = vendor_name;
		packingList.poid = pl_po_id;
		packingList.shipto = ship_to_val;
		packingList.shipdate = ship_date_val;
		packingList.delmethod = delivery_method_val;
		packingList.shiporigin = shipment_origin_val;
		packingList.status = status_val;
		packingList.plnum = pl_num_val;
		packingList.datecreated = pl_date_created_val;
		packingList.memo = memo_val;
		packingList.shipment_pt = shipment_pt_val;
		
		packingList.itemdetails = [];
		
	
	var fields_publish_pl_line= {key:"packinglist_ref",operator:"=",value:pll_num,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list_lines',fields_publish_pl_line);
	dbs.readData(function (result1){
		console.log("result po_publish_pl :: "+ result1.length);
		for (var i=0; i<result1.length; i++) 
		{
			var itemdetailsVal = new Object();
					
			itemdetailsVal.item = result1[i].item_id;
			itemdetailsVal.name = result1[i].item_name;
			itemdetailsVal.orderedquantity = result1[i].qty_ordered; 
			itemdetailsVal.dispatchedquantity = result1[i].qty_dispatched;
			itemdetailsVal.netwt = result1[i].net_wt;
			itemdetailsVal.grosswt = result1[i].gross_wt;
			itemdetailsVal.description = result1[i].description;
			itemdetailsVal.poid = pl_po_id;
			
			packingList.itemdetails[i] = itemdetailsVal;
			console.log("itemdetailsVal.description  "+itemdetailsVal.description);	
		}
	
	

	console.log('results::: Packing List Json '+ packingList);
	var rest_params = packingList; //{"vendorid":vendor_name,"event":"create","timestamp":time_stamp,"poid":po_id,"shipto":ship_to,"shipdate":ship_date,"delmethod":del_method,"shiporigin":ship_origin,"plstatus":pl_status};

	function onFailure(err) 
	{
	  process.stderr.write("Refresh Failed: " + err.message + "\n");
	  //process.exit(1);
	}
	// This will try the cached version first, if not there will run and then cache 
	search.run(rest_params, function (err, results) 
	{
		if (err) onFailure(err);
		console.log('results:::'+results.length);
		var parsed_response=JSON.stringify(results);
		console.log('parsed_response:::'+parsed_response);
								
		var pl_status = results.publishstatus;
		console.log('pl_status ::'+pl_status);
		var pl_ID = results.ns_id;
		console.log('pl_ID::'+pl_ID);
		
		
		if(pl_status=="Successful")
		{
			
			var update_query = "update packing_list set STATUS ='Shipped', packing_list_ns_id ='"+ pl_ID +"' where packing_list_num='" + pl_num
								+ "' AND vendor_ns_id='" + id + "'";
			var fields_update_query = {query:update_query};		
			dbs.query(null,fields_update_query);
			dbs.update();
			
			var update_query_pll = "update packing_list_lines set packing_list_ns_id ='"+ pl_ID +"' where packinglist_ref='" + pl_num
								+ "' AND vendor_ns_id='" + id + "'";
								
			var fields_update_query2 = {query:update_query_pll};		
			dbs.query(null,fields_update_query2);
			dbs.update();
			
			var update_query_po = "update purchase_order set order_status ='Pending Delivery'" + " where po_ns_id='" + pl_po_id
								+ "' AND vendor_ns_id='" + id + "'";
			var fields_update_query_po = {query:update_query_po};		
			dbs.query(null,fields_update_query_po);
			dbs.update();
			//db.run("update packing_list set STATUS ='Shipped' where packing_list_num='"+pl_num+"'");
			
			//res.redirect(303,'/packinglistview?pl_number='+pl_num);
			console.log('****************Record status supdated succesfully******************');
		}
		
	});
	});
	//res.redirect(303,'/packinglistview?pl_number='+pl_num);
	});
	setTimeout(function () {
         res.redirect(303,'/packinglistview?pl_number='+pl_num+'&notdata[]='+notdata+'&count='+count);
        }, 7000);
}
else
{
	res.render('signout',{});
}
	

});

/*Get Search Results */
app.post('/dashboard',function(req,res){
	
if(id)
{
	//transactionsearch
	console.log("***** POST transactionsearch START ****** ");
	
	console.log('post of transactionsearch');
	console.log('Search key ==>'+req.body.your_searchid);
	console.log('purchase_order_tbl ==>'+req.body.tran);
	
	var recordType = req.body.tran;
	var searchKeyValue = req.body.your_searchid;
	
	if(recordType=='Purchase Order')
	{
	
		var po_numberSrch = new Array();
		var po_idSrch = new Array();
		var po_statusSrch = new Array();
		var po_date_createSrch = new Array();
		var po_amountSrch = new Array();
		//PO12350
		//var searchContents = db.run("select * from purchase_order where po_number="+searchKeyValue+"");
		
		//var searchContents = db.exec("select * from purchase_order where po_number='"+searchKeyValue+"'");
		
		searchKeyValue = "'" + searchKeyValue + "'" ;
		var fields_searchContents= {key:"po_number",operator:"=",value:searchKeyValue,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('purchase_order',fields_searchContents);
		dbs.readData(function (result){
		//console.log("result fields_searchContents :: "+ result);
		console.log('searchContents ==>'+ JSON.stringify(result));
		//po_pendingDelivery_count = result;
		
		if(result!=null)
		{
		
		
		for (var i=0; i<result.length; i++) 
		{
			po_idSrch[i] = result[i].po_ns_id; 
			po_numberSrch[i] = result[i].po_number;
			po_statusSrch[i] = result[i].order_status; 
			po_date_createSrch[i] = dt.date_formatter(result[i].tran_date);
			po_amountSrch[i] = result[i].total;
		}
	
		//res.redirect(303,'/searchedpoview');
		
		


		res.render('searchedpoview', { //render the index.ejs
		vendorname:vendor_name,
		v_id:id,
		notdata_rend:notdata,
	  	count_rend:count,
		poSrchCount:result.length,
		tran_no_srch:po_numberSrch,
		tran_id_srch:po_idSrch,
		tran_status_srch:po_statusSrch,
		tran_date_srch:po_date_createSrch,
		tran_amount_srch:po_amountSrch
		
		});
		}
		else
		{
		
			res.render('searchedpoview', { //render the index.ejs
			vendorname:vendor_name,
			v_id:id,
			notdata_rend:notdata,
	  		count_rend:count,
			poSrchCount:0
		
			});
		}
		});
	}
	else if(recordType=='Packing List')
	{
			console.log("I am in PL search ");
		
		searchKeyValue = "'" + searchKeyValue + "'" ;
		var pl_numberSrch = new Array();
		var pl_idSrch = new Array();
		var pl_statusSrch = new Array();
		var pl_date_createSrch = new Array();
		var pl_amountSrch = new Array();
		var pl_poNumberSrch = new Array();
		var pl_memoSrch = new Array();
		var pl_numSrch = new Array();
		
		//9002
	//	var searchContents = db.exec("select * from packing_list where packing_list_num='"+searchKeyValue+"'");
	
		var fields_searchContents= {key:"packing_list_num",operator:"=",value:searchKeyValue,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
		dbs.query('packing_list',fields_searchContents);
		dbs.readData(function (result){
		//console.log("result fields_searchContents :: "+ result);
		console.log('searchContents ==>'+ JSON.stringify(result));
	
		//console.log('searchContents pl count ==>'+searchContents);
		if(result !='')
		{
			console.log("searchContents length : "+result.length);
		
			for (var i=0; i<result.length; i++) 
			{
				pl_idSrch[i] = result[i].packing_list_ns_id; 
				console.log('PL ID ==>'+result[i].packing_list_ns_id);
				pl_numSrch[i] = result[i].packing_list_num; 
				console.log('PL # ==>'+result[i].packing_list_num);
				pl_statusSrch[i] = result[i].status; 
				pl_date_createSrch[i] = dt.date_formatter(result[i].date_created);
				pl_poNumberSrch[i] = result[i].po_num;
				pl_memoSrch[i] = result[i].memo;
			}
			
			//res.redirect(303,'/searchedpackinglistview');
			res.render('searchedpackinglistview', { //render the index.ejs
			vendorname:vendor_name,
			v_id:id,
			notdata_rend:notdata,
	  		count_rend:count,
			plSrchCount:result.length,
			tran_id_srch:pl_idSrch,
			tran_num_srch:pl_numSrch,
			tran_status_srch:pl_statusSrch,
			tran_date_srch:pl_date_createSrch,
			tran_po_num_srch:pl_poNumberSrch,
			tran_memo_srch:pl_memoSrch
			
			});
			
		}
		else
		{
			res.render('searchedpackinglistview', { //render the index.ejs
			v_id:id,
			notdata_rend:notdata,
	  		count_rend:count,
			vendorname:vendor_name,
			plSrchCount:0
				
			});
		}
		});	
	}
	else
	{
		
	}
	
	//res.redirect(303,'/searchedpackinglistview');
	
	console.log("***** POST transactionsearch END ****** ");
}
else
{
	res.render('signout',{});
}
	
}); 
 
/*Get acknowledge PO */
app.get('/acknowledgePO', requireLogin, function(req,res,next){
	
if(id)
{
		console.log("Acknowledge Purchase Order......");
	
	var rec_type='PurchaseOrder';
	module.exports.rec_type = rec_type;

	
	var po_id = req.query.po_ns_id;
	console.log("po_id  "+po_id);
	
	var rest_params = {"ack_check":"T","event":"acknowledge","po_id_ns":po_id,"vendor_id":id};
	
	function onFailure(err) {
		process.stderr.write("Acknowledge Failed: " + err.message + "\n");
		//process.exit(1);
	}

// This will try the cached version first, if not there will run and then cache
// trigger the restlet
 
search.run(rest_params, function (err, results) {
  if (err) onFailure(err);
 
 
   console.log('results:::'+results);
  var parsed_response=JSON.stringify(results);
	console.log('parsed_response:::'+parsed_response);
  var status_ack=results.ackstatus;
   	console.log('status::'+status_ack);
	
	var date_obj=new Date();
		Number.prototype.padLeft = function(base,chr){
		    var  len = (String(base || 10).length - String(this).length)+1;
		    return len > 0? new Array(len).join(chr || '0')+this : this;
		}
					
	var date_obj = new Date,
	    current_date = [(date_obj.getMonth()+1).padLeft(),
	               date_obj.getDate().padLeft(),
	               date_obj.getFullYear()].join('/') +' ' +
	              [date_obj.getHours().padLeft(),
	               date_obj.getMinutes().padLeft(),
	               date_obj.getSeconds().padLeft()].join(':');	

	if(status_ack=='Successful')
	{
		var update_query = "update purchase_order set order_status='Acknowledged',ack_date='"
					+ current_date + "' where po_ns_id="+po_id
					+ " and vendor_ns_id::integer='" + id + "'";
		var fields_acknowledge_PO= {query:update_query};
		dbs.query('purchase_order',fields_acknowledge_PO);
		dbs.update();
	}
	
	setTimeout(function () {
           res.redirect(303,'/poview?record_type=PurchaseOrder&po_ns_id='+po_id+'&notdata[]='+notdata+'&count='+count);
        }, 3000);
	
	
});
}
else
{
	res.render('signout',{});
}
	


});

/*terminate server*/
app.get('/signout', requireLogin, function(req, res, next) {

 console.log('Logout page loaded');
 
 id=null;
 
 /* res.writeHead(302, {
  'Location': 'C:/nodeapp/public/login.html'
  //add other headers here...
});
res.end();
 */
  
	  setTimeout(function () {
            
			 //server.close();
			//sockets[3000].destroy();
            // TypeError: Object function app(req, res){ app.handle(req, res); } has no method 'close'
        }, 5);
req.session.reset();
res.render('signout',{});
		//window.location.href("login.html");
 
});

/* D3 page. */
app.get('/d3', requireLogin, function(req, res, next) { // route for '/'
	
	var pl_name = new Array();
	var pl_id = new Array();
	var pl_status = new Array();
	var pl_date = new Array();
	var pl_number = new Array();
	var plChild = new Array();
	
	var ir_name = new Array();
	var ir_id = new Array();
	var ir_ext_id = new Array();
	var ir_status = new Array();
	var ir_date = new Array();
	
	var vb_name = new Array();
	var vb_id = new Array();
	var vb_status = new Array();
	var vb_date = new Array();
	
	var billChild = new Array();
	var poChild = new Array();
	
	var po_number =null;
	var po_date =null;
	var po_status =null;
	var poParent = null;
	
	var po_id = req.query.po_ns_id;
	console.log("po_id  "+po_id);
	if(id){
	console.log("Data Driven Documents View");
	console.log("vendor_id  " + id);
	
	var fields_PackingListContents= {key:"po_ns_id",operator:"=",value:po_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('packing_list',fields_PackingListContents);
	dbs.readData(function (result){
		if(result!=''){
			for (var i=0; i<result.length; i++){
				pl_id[i] = result[i].packing_list_ns_id; 
				pl_status[i] =result[i].status;
				pl_date[i]= dt.date_formatter(result[i].date_created);
				pl_number[i]= result[i].packing_list_num;
				poChild.push({name:"Packing List",assigned:"Packing List::"+pl_number[i],href:"https://supplier-portal.herokuapp.com/packinglistview?pl_number="+pl_number[i],date:pl_date[i],status:pl_status[i]});
				billChild.push({name:"Bill Payment",assigned:"Bill Payment::"+pl_id[i],date:pl_date[i],status:pl_status[i]});
			}
		}
});
	
	var fields_ItemReceiptContents= {key:"purchase_order_id",operator:"=",value:po_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('Item_Receipt',fields_ItemReceiptContents);
	dbs.readData(function (result){
		if(result!=''){
			for (var i=0; i<result.length; i++){
				ir_id[i] = result[i].ns_id; 
				//ir_status[i] =result[i].status;
				ir_date[i]= dt.date_formatter(result[i].created_date);
				ir_ext_id[i]= result[i].ns_ext_id;
				poChild.push({name:"Item Receipt",assigned:"Item Receipt::"+ir_ext_id[i],href:"https://supplier-portal.herokuapp.com/ItemReceiptsView?ns_id="+ir_id[i],date:ir_date[i]});
			}
		}
});
	
	var poidfq = "'" + po_id + "'";
	var fields_VendorBillContents= {key:"po_ns_id",operator:"=",value:poidfq,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('bill_list',fields_VendorBillContents);
	dbs.readData(function (result){
		if(result!=''){
			for (var i=0; i<result.length; i++){
				vb_id[i] = result[i].bill_list_ns_id; 
				vb_status[i] =result[i].status;
				vb_date[i]= dt.date_formatter(result[i].bill_date);
				poChild.push({name:"Bill",assigned:"Bill::"+vb_id[i],date:vb_date[i],href:"https://supplier-portal.herokuapp.com/billview?bill_ns_id="+vb_id[i],status:vb_status[i],children:billChild});
			}
		}
});
	
	var fields_POContents= {key:"po_ns_id",operator:"=",value:po_id,key1:"VENDOR_NS_ID::integer",operator1:"=",value1:id};
	dbs.query('purchase_order',fields_POContents);
	dbs.readData(function (result){
		if(result!=''){
			for (var i=0; i<result.length; i++){
				po_number = result[i].po_number; 
				po_date = dt.date_formatter(result[i].tran_date); 
				po_status = result[i].order_status; 
			}
		}
				
});
	
	 setTimeout(function () {
		 poParent = {name:"Purchase Order",assigned:"Purchase Order::"+po_number,href:"https://supplier-portal.herokuapp.com/poview?po_ns_id="+po_id,date:po_date,status:po_status,children:poChild};
			console.log("after poParent : "+poParent);
			
		res.render('d3',{
			tran_ponumber:po_number,
			tran_po:poParent
		});},5000);
	
	
	  }
else
{
	res.render('signout',{});
}
});