//===================================================================
var RECORD_SUBSIDIARY = 'custrecord_je_subsidiary_intid';
var FIELD_ID_EXTERNAL_ID = 'externalid';
var FIELD_ID_INTERNAL_ID = 'internalid';
var RECORD_TYPE_AFFILIATE = 'custrecord_je_affilate_intid';
var RECORD_TYPE_FUTURE = 'custrecord_je_future_intid';
var RECORD_TYPE_INDUSTRY = 'custrecord_je_industry_intid';
var RECORD_MEMO = 'custrecord_je_memo';
var RECORD_POSTING_PERIOD = 'custrecord_je_postingperiod';
var RECORD_DATE = 'custrecord_je_date';
var LINE_ID = 'recmachcustrecord_je_stageid';
var RECORD_ACCOUNT = 'custrecord_je_line_acc_intid';
var RECORD_DEBIT = 'custrecord_je_debit';
var RECORD_CREDIT = 'custrecord_je_credit';
var RECORD_COSTCENTER = 'custrecord_je_costcenter_intid';
var RECORD_LOCATION = 'custrecord_je_location_intid';
var RECORD_SERVICELINE = 'custrecord_je_serviceline_intid';
var RECORD_JE_NUMBER = 'custrecord_je_ns_je_no';
var RECORD_HEADER_ERROR = 'custrecord_je_header_error';
var RECORD_HEADER_STATUS = 'custrecord_je_status';
var JOURNAL_ENTRY = 'journalentry';
var RECORD_TYPE_AFFILIATE_EXTERNALID = 'custrecord_je_affilate';
var RECORD_TYPE_INDUSTRY_EXTERNALID = 'custrecord_je_industry';
var RECORD_TYPE_FUTURE_EXTERNALID = 'custrecord_je_future';
var RECORD_ACCOUNT_EXTERNALID = 'custrecord_je_account';
var RECORD_COSTCENTER_EXTERNALID = 'custrecord_je_costcenter';
var RECORD_LOCATION_EXTERNALID = 'custrecord_je_location';
var RECORD_SERVICELINE_EXTERNALID = 'custrecord_je_serviceline';
var RECORD_FILE_NAME='custrecord_je_ceridian_file_name';


var RECORD_TYPE_AFFILIATE = 'customrecord_ul_cust_affiliate_record';
var RECORD_TYPE_FUTURE_SEGMENT = 'customrecord_ul_cust_future_seg_record';
var RECORD_TYPE_INDUSTRY = 'customrecord_ul_cust_industry_record';

//Ceridian Payroll Stage Line
var locationLookup = [];
var accountLookup = [];
var costCenterLookup = [];
var serviceLineLookup = [];

//Ceridian Payroll Stage
var affiliateLookup = [];
var industryLookup = [];
var futureLookup = [];


/**
* load the record reference fields into memory - to be used in lookups
*/
function loadLookUpData() {
    try {
        locationLookup = getLookUpData('location');
        accountLookup = getLookUpData('account');
        costCenterLookup = getLookUpData('department');
        serviceLineLookup = getLookUpData('classification');
        affiliateLookup = getLookUpData('customrecord_ul_cust_affiliate_record');
        industryLookup = getLookUpData('customrecord_ul_cust_industry_record');
        futureLookup = getLookUpData('customrecord_ul_cust_future_seg_record');

    }
    catch (e) {
        throw ('unable to load lookup data' + e);
    }
}

/**
* search records for lookup data
*/

function getLookUpData(recordName) {
    var filters = [];
    var data = [];

    filters.push(new nlobjSearchFilter('isinactive', null, 'is', 'F'));

    var searchColumnId = 'internalid';
    var searchColumnId1 = 'externalid';

    var searchColumn = [];
    searchColumn[0] = new nlobjSearchColumn(searchColumnId);
    searchColumn[1] = new nlobjSearchColumn(searchColumnId1);

    // create search; alternatively nlapiLoadSearch() can be used to load a saved search
    var search = nlapiCreateSearch(recordName, filters, searchColumn);
    var searchResults = search.runSearch();
    var resultSet = searchResults.getResults(0, 1000);

    for (var rs = 0; rs < resultSet.length; rs++) {
        data.push({ 'internalid': resultSet[rs].getValue('internalid'), 'externalid': resultSet[rs].getValue('externalid') });
    }
    return data;
}

/**
* lookup internal id
*/
function lookUp(externalID, lookupData) {

    if (externalID == null || externalID == '')
        return '';

    for (i = 0; i < lookupData.length; i++) {
        if (externalID === lookupData[i]['externalid']) {
            return lookupData[i]['internalid']
        }
    }
    return '';
}


//=======================================================================
function OnStart(request, response) {
    var context = nlapiGetContext();
    var usage = context.getRemainingUsage();
    nlapiLogExecution('Debug', 'createJournalEnrty ', 'Starting usage limit==' + usage);
    // load look up data
    try {
        loadLookUpData()
    }
    catch (e) {
        // send error and redirect to staging record and stop further processing
        nlapiLogExecution('Debug', 'loadLookUpData ', 'Error==' + e);
    }

    nlapiLogExecution('Debug', 'look up data is complete');

    // create journal entry
    try {
        //Take the values from request parameter
        var s_rec_type = request.getParameter('s_rec_type');
        var i_rec_id = request.getParameter('i_rec_id');

        //Call createJE function
        var JE_NUMBER = createJournalEntry(s_rec_type, i_rec_id);

        // Set JE number on Ceridian Payroll Stage record
        if (_logValidation(JE_NUMBER)) {
            var setFieldIdArray = [RECORD_HEADER_ERROR, RECORD_HEADER_STATUS, RECORD_JE_NUMBER];
            var setValueArray = ['', 'success', JE_NUMBER]
            nlapiSubmitField(s_rec_type, i_rec_id, setFieldIdArray, setValueArray); // Update JE number on Caridian record
            nlapiSetRedirectURL('RECORD', JOURNAL_ENTRY, JE_NUMBER); // Redirect on Caridian Record
        }

    }
    catch (e) {

        // send error and redirect to staging record and stop further processing
        var setFieldIdArray = [RECORD_HEADER_ERROR, RECORD_HEADER_STATUS];
        var setValueArray = [e.message, 'failed']
        nlapiSubmitField(s_rec_type, i_rec_id, setFieldIdArray, setValueArray); // Update JE number on Caridian record
        nlapiSetRedirectURL('RECORD', s_rec_type, i_rec_id, false) // redirect to staging record
    }
    var usage = context.getRemainingUsage();
    nlapiLogExecution('Debug', 'createJournalEnrty ', 'End usage limit==' + usage);
}
// 
function createJournalEntry(s_rec_type, i_rec_id) {

    try {

        var stagingRecord = nlapiLoadRecord(s_rec_type, i_rec_id);

        nlapiLogExecution('Debug', 'staging record loaded');

        var subsidiary = stagingRecord.getFieldValue('custrecord_je_subsidiary_intid');
        var date = stagingRecord.getFieldValue('custrecord_je_date');
        //var memo = stagingRecord.getFieldValue('custrecord_je_subsidiary') + ' Payroll ' + stagingRecord.getFieldValue('custrecord_je_postingperiod');
        var affiliate = lookUp(stagingRecord.getFieldValue('custrecord_je_affiliate'), affiliateLookup);
        var industry = lookUp(stagingRecord.getFieldValue('custrecord_je_industry'), industryLookup);
        var futureSegment = lookUp(stagingRecord.getFieldValue('custrecord_je_future'), futureLookup);
        var externalID = stagingRecord.getFieldValue('externalid');
        var itemCount = stagingRecord.getLineItemCount(LINE_ID);
        var memo=stagingRecord.getFieldValue(RECORD_FILE_NAME);
        nlapiLogExecution('Debug', 'createJournalEntry','itemCount=='+itemCount);
        nlapiLogExecution('Debug', 'header fields read');


        //Creating Journal Entry
        var o_ul_jeRecord = nlapiCreateRecord(JOURNAL_ENTRY, { recordmode: 'dynamic' });

        nlapiLogExecution('Debug', 'JE created with id ' + o_ul_jeRecord);

        if (_logValidation(subsidiary))
            o_ul_jeRecord.setFieldValue('subsidiary', parseInt(subsidiary));

        if (_logValidation(date))
            o_ul_jeRecord.setFieldValue('trandate', date);

        if (_logValidation(memo))
            o_ul_jeRecord.setFieldValue('memo', memo);

        if (_logValidation(affiliate))
            o_ul_jeRecord.setFieldValue('custbodycustbody_ul_cust_affiliate', parseInt(affiliate));

        if (_logValidation(industry))
            o_ul_jeRecord.setFieldValue('custbodycustbody_ul_cust_industry', parseInt(industry));

        if (_logValidation(futureSegment))
            o_ul_jeRecord.setFieldValue('custbodycustbody_ul_cust_future', parseInt(futureSegment));

        o_ul_jeRecord.setFieldValue('custbody_ul_ceridian_staging_id', parseInt(i_rec_id));
        
        nlapiLogExecution('Debug', 'JE header fields set');

        for (var i = 1; i <= itemCount; i++) {

            nlapiLogExecution('Debug', 'JE line fields set for line ' + i);

            //Getting the field values from Ceridian record
            var i_account = lookUp(stagingRecord.getLineItemValue(LINE_ID, RECORD_ACCOUNT_EXTERNALID, i), accountLookup);
            var i_debit = stagingRecord.getLineItemValue(LINE_ID, RECORD_DEBIT, i);
            var i_credit = stagingRecord.getLineItemValue(LINE_ID, RECORD_CREDIT, i);
            var i_costcenter = lookUp(stagingRecord.getLineItemValue(LINE_ID, RECORD_COSTCENTER_EXTERNALID, i), costCenterLookup);
            var i_location = lookUp(stagingRecord.getLineItemValue(LINE_ID, RECORD_LOCATION_EXTERNALID, i), locationLookup);
            var i_serviceline = lookUp(stagingRecord.getLineItemValue(LINE_ID, RECORD_SERVICELINE_EXTERNALID, i), serviceLineLookup);

            //Setting the values on JE record
            o_ul_jeRecord.selectNewLineItem('line');

            if (_logValidation(i_account)) {
                o_ul_jeRecord.setCurrentLineItemValue('line', 'account', parseInt(i_account));
            }

            if (_logValidation(i_debit))
                o_ul_jeRecord.setCurrentLineItemValue('line', 'debit', parseFloat(i_debit));

            if (_logValidation(i_credit))
                o_ul_jeRecord.setCurrentLineItemValue('line', 'credit', parseFloat(i_credit));

            if (_logValidation(i_costcenter))
                o_ul_jeRecord.setCurrentLineItemValue('line', 'department', parseInt(i_costcenter));

            if (_logValidation(i_location))
                o_ul_jeRecord.setCurrentLineItemValue('line', 'location', parseInt(i_location));

            if (_logValidation(i_serviceline))
                o_ul_jeRecord.setCurrentLineItemValue('line', 'class', parseInt(i_serviceline));

            o_ul_jeRecord.setCurrentLineItemValue('line', 'memo', memo);

            o_ul_jeRecord.commitLineItem('line');
        }

        nlapiLogExecution('Debug', 'JE submit before');

        var o_submit_je = nlapiSubmitRecord(o_ul_jeRecord, false, true);
        nlapiLogExecution('Debug', 'o_submit_je ', o_submit_je);

        nlapiLogExecution('Debug', 'JE submit after');

        return o_submit_je;

    }
    catch (e) {
        //nlapiSubmitField(s_rec_type, i_rec_id, RECORD_HEADER_ERROR, e.message); // Update Error field on Caridian record
        //nlapiSubmitField(s_rec_type, i_rec_id, RECORD_HEADER_STATUS, 'failed'); // Update status on Caridian record
        //nlapiSetRedirectURL('RECORD', s_rec_type, i_rec_id, false) // redirect to staging record
        throw (e);
    }
}

function _logValidation(value) {
    if (value != null && value != '' && value != undefined && value.toString() != 'NaN' && value != NaN) {
        return true;
    }
    else {
        return false;
    }
}
