/*
 * This script requires the library scripts:
 *	- EditionUsersLibrary.js
 */

var TYPE;

function AfterSubmit(type) {
    var where = 'AfterSubmit';
    var show = true;
    log(show, where, '********* start **********');

    TYPE = type;

    var contractLineRecID = nlapiGetRecordId();
    var contractID = nlapiGetFieldValue('custrecord_cl_contract');
    log(show, where, 'type=' + type + ', contractLineRecID=' + contractLineRecID + ', contractID=' + contractID);

    if (contractID) {
        // Set flag so the contract-line combiner picks this up.
        if (type == 'edit' || type == 'create' || type == 'delete') {
            nlapiSubmitField('customrecord_contract', contractID, 'custrecord_c_needscombining', 'T');
        }

        var upgradeFlag = inactivateDeluxeOrBasic(contractID);

        setLRVForNegativeUsers(contractID);
        calculateRevenueValue(contractID);
        updateNumOfUsers(contractID);

        zeroRevenueValueIfAllLinesCancelled(contractID);
    }

    log(show, where, '********* end **********');
}

function calculateRevenueValue(contractID) {
    var where = 'calculateRevenueValue';
    var show = true;
    log(show, where, '********* start **********');

    log(show, where, 'contractID=' + contractID);

    // get contract's customer
    var customerID = nlapiLookupField('customrecord_contract', contractID, 'custrecord_c_customer');

    var revenueValue = 0;

    var filters = new Array();
    filters.push(new nlobjSearchFilter('custrecord_cl_contract', null, 'anyof', contractID));
    filters.push(new nlobjSearchFilter('custrecord_cl_cancelled', null, 'is', 'F'));

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_cl_item'));
    columns.push(new nlobjSearchColumn('custrecord_cl_price'));
    columns.push(new nlobjSearchColumn('custrecord_cl_qty'));
    columns.push(new nlobjSearchColumn('custrecord_cl_cancelled'));
    columns.push(new nlobjSearchColumn('custrecord_cl_contract'));
    columns.push(new nlobjSearchColumn('custrecord_cl_discountamt'));
    columns.push(new nlobjSearchColumn('custrecord_cl_baseprice'));

    var contractLineItems = nlapiSearchRecord('customrecord_contractline', null, filters, columns) || [];

    for (var i = 0; i < contractLineItems.length; i++) {
        var lineItem = contractLineItems[i];
        nlapiLogExecution('debug', 'inside the contractline loop 389', lineItem.getValue('custrecord_cl_price'));
        log(show, where, 'inside contract line loop, i=' + i);

        var itemID = lineItem.getValue('custrecord_cl_item');
        var parentItemID = nlapiLookupField('item', itemID, 'parent');
        var price = lineItem.getValue('custrecord_cl_price');
        var qty = lineItem.getValue('custrecord_cl_qty');
        log(show, where, 'itemID=' + itemID + ', parentItemID=' + parentItemID + ', price=' + price + ', qty=' + qty);

        var itemName = nlapiLookupField('item', itemID, 'displayname');
        var lineItemPrice = parseFloat(price) * parseFloat(qty);
        revenueValue = revenueValue + lineItemPrice;
        contractID = lineItem.getValue('custrecord_cl_contract');

        var editionName = '';
        if (parentItemID == '103') {
            // spg
            var prevEditionName = nlapiLookupField('customrecord_contract', contractID, 'custrecord_currentedition');
            var prevTrialApp = nlapiLookupField('customrecord_contract', contractID, 'custrecord_c_trialapp');
            log(show, where, 'prevEditionName=' + prevEditionName + ', prevTrialApp=' + prevTrialApp);

            if (itemName.toLowerCase().indexOf("trial") != -1) {
                editionName = "Trial";
            }
            else if (itemName.toLowerCase().indexOf("basic") != -1) {
                editionName = "Basic";
            }
            else if (itemName.toLowerCase().indexOf("deluxe") != -1) {
                editionName = "Deluxe";
            }
            else if (itemName.toLowerCase().indexOf("pro") != -1) {
                editionName = "Pro";
            }
            else if (itemName.toLowerCase().indexOf("enterprise") != -1) {
                editionName = "Enterprise";
            }

            var contractFieldAry = [];
            var contractValueAry = [];

            //nlapiSubmitField('customrecord_contract', contractID, 'custrecord_currenteditionitemid', itemID);
            contractFieldAry.push('custrecord_currenteditionitemid');
            contractValueAry.push(itemID);

            //nlapiSubmitField('customrecord_contract', contractID, 'custrecord_currentedition', editionName);
            contractFieldAry.push('custrecord_currentedition');
            /*
             contractValueAry.push(editionName);
             log(show, where, 'set contract\'s custrecord_currenteditionitemid to ' + itemID + ' and custrecord_currentedition to ' + editionName);
             */
            contractValueAry.push(itemName);
            log(show, where, 'set contract\'s custrecord_currenteditionitemid to ' + itemID + ' and custrecord_currentedition to ' + itemName);

            // spg
            if ((prevEditionName.toLowerCase().indexOf('trial') != -1 || prevTrialApp == 'T') && editionName != 'Trial') {
                //nlapiSubmitField('customrecord_contract', contractID, 'custrecord_c_trialapp', 'F');
                contractFieldAry.push('custrecord_c_trialapp');
                contractValueAry.push('F');
                log(show, where, 'unchecked contract\'s custrecord_c_trialapp checkbox');

                var today = new Date();
                var todaysDate = today.getDate();

                //nlapiSubmitField('customrecord_contract', contractID, 'custrecord_c_billingday', todaysDate);
                contractFieldAry.push('custrecord_c_billingday');
                contractValueAry.push(todaysDate);

                var todayAsStr = dateObjAsStr(today);

                contractFieldAry.push('custrecord_c_payingcustdate');
                contractValueAry.push(todayAsStr);
                log(show, where, 'since contract\'s previous edition was Trial, and it\'s current edition is not, set contract\'s custrecord_c_billingday to ' + todaysDate + ' and its custrecord_c_payingcustdate to ' + todayAsStr);

                // Set DYSSP Start Date field to same date (today) as Paying Customer Date field
                contractFieldAry.push('custrecord_contract_dysspstartdate');
                contractValueAry.push(todayAsStr);

                if (customerID) {
                    nlapiSubmitField('customer', customerID, 'entitystatus', 13);
                    log(show, where, 'set customer ID ' + customerID + ' entitystatus to Customer - Closed Won (13)');
                }
            }

            nlapiSubmitField('customrecord_contract', contractID, contractFieldAry, contractValueAry);
        }
        else {
            var numOfUsers = parseInt(lineItem.getValue('custrecord_cl_qty'));
            var totalNumOfUsers = totalNumOfUsers + numOfUsers;
        }
    }

    nlapiSubmitField('customrecord_contract', contractID, 'custrecord_c_recurringvalue', revenueValue);

    // upgrade the users line items based on the current edition
    log(show, where, 'upgrading users line items');

    var currEdition = nlapiLookupField('customrecord_contract', contractID, 'custrecord_currentedition');
    if (currEdition) {
        var currEditionAppType = extractAppType(currEdition);
        if (currEditionAppType) {
            currEdition = currEditionAppType;
        }
    }
    log(show, where, 'currEdition=' + currEdition);

    var usersPrice = 0;
    var upgradeFlag = 0;
    var numOfUsers = 0;
    var usersDiscountAmt = 0;
    var usersBasePrice = 0;

    for (var c = 0, len = contractLineItems.length; c < len; c++) {
        var lineItem = contractLineItems[c];
        var lineItemID = lineItem.getId();
        var itemID = lineItem.getValue('custrecord_cl_item');
        var itemParent = nlapiLookupField('item', itemID, 'parent');
        var itemName = nlapiLookupField('item', itemID, 'displayname');

        log(show,where,'itemName: '+itemName+' currEdition: '+currEdition);
            //hardcoding of itemId 596 exception as per INS-314 mmarkowitz/dsmith 1/24/14
        if (itemName.indexOf(currEdition) == -1 && itemParent == '104' && itemID != '596') {  // If the users type != current edition type
                usersPrice = lineItem.getValue('custrecord_cl_price');
                numOfUsers = parseInt(numOfUsers + parseInt(lineItem.getValue('custrecord_cl_qty')));
                log(show, where, 'usersPrice=' + usersPrice);
                usersDiscountAmt = lineItem.getValue('custrecord_cl_discountamt');
                usersBasePrice = lineItem.getValue('custrecord_cl_baseprice');
            
                log(show,'custrecord_cl_cancelled','$$$$$$$$$$$$$$$$$$$$  193');
                nlapiSubmitField('customrecord_contractline', lineItemID, 'custrecord_cl_cancelled', 'T');

                upgradeFlag = 1;
            }
        }
    }

    if (upgradeFlag == 1) {
        log(show, where, 'switch current edition, currEdition=' + currEdition);

        /*
         var editionToUsersItemID = {
         'Basic':		'36',
         'Deluxe':		'42',
         'Pro':			'87',
         'Enterprise':	'69'
         };
         var usersItemID = (editionToUsersItemID[currEdition] ? editionToUsersItemID[currEdition] : '');
         */
        var usersItemID = appTypeToUsersItemID(currEdition);

        //var totalNumOfUsers = nlapiLookupField('customrecord_contract', contractID, 'custrecord_numberofusers');

        //var lineItemQty = parseInt(totalNumOfUsers) - 2;

        if (usersItemID) {
            var lineItemRec = nlapiCreateRecord('customrecord_contractline');

            lineItemRec.setFieldValue('custrecord_cl_contract', contractID);
            lineItemRec.setFieldValue('custrecord_cl_customer', customerID);
            lineItemRec.setFieldValue('custrecord_cl_item', usersItemID);

            log(show, where, 'usersItemID=' + usersItemID);

            var itemDesc = nlapiLookupField('item', usersItemID, 'salesdescription');
            lineItemRec.setFieldValue('custrecord_cl_itemdescription', itemDesc);
            lineItemRec.setFieldValue('custrecord_cl_qty', numOfUsers);
            lineItemRec.setFieldValue('custrecord_cl_price', usersPrice);
            lineItemRec.setFieldValue('custrecord_cl_discountamt', usersDiscountAmt);
            lineItemRec.setFieldValue('custrecord_cl_baseprice', usersBasePrice);

            var liID = nlapiSubmitRecord(lineItemRec);
            log(show, where, 'liID (line item ID)=' + liID);
        }
    }

    log(show, where, '********* end **********');
}

function inactivateDeluxeOrBasic(contractID) {
    var where = 'inactivateDeluxeOrBasic';
    var show = true;
    log(show, where, '********* start **********');

    log(show, where, 'contractID=' + contractID);

    var upgradeFlag = 0;

    //var itemFlag = 0;
    //var soItemFlag = 0;
    var prevAppEdition = '';
    var newAppEdition = '';

    // check if contract record contains Basic or Deluxe item
    var currItemID = nlapiGetFieldValue('custrecord_cl_item');

    var filters = new Array();
    filters.push(new nlobjSearchFilter('custrecord_cl_contract', null, 'anyof', contractID));
    filters.push(new nlobjSearchFilter('custrecord_cl_cancelled', null, 'is', 'F'));

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_cl_item'));
    columns.push(new nlobjSearchColumn('custrecord_cl_price'));
    columns.push(new nlobjSearchColumn('custrecord_cl_lostrevenuedate'));

    var contractLineItems = nlapiSearchRecord('customrecord_contractline', null, filters, columns);
    log(show, where, 'contractLineItems=' + (contractLineItems != null ? contractLineItems.length : "null"));

    for (var i = 0; contractLineItems != null && i < contractLineItems.length; i++) {
        var lineItem = contractLineItems[i];
        var itemID = lineItem.getValue('custrecord_cl_item');
        nlapiLogExecution('debug', 'contract line item id', itemID);
        log(show, where, 'contract line item, i=' + i + ', itemID=' + itemID);

        if (itemID != currItemID) {
            //if (itemID == '38' || itemID == '39' || itemID == '44' || itemID == '45' || itemID == '89' || itemID == '90') {
            if (isBasicDeluxeOrProApp(itemID)) {
                //itemFlag = itemID;
                prevAppEdition = itemID;
                log(show, where, 'itemID=' + itemID + ' on contractID=' + contractID);

                //if (itemID == '38' || itemID == '39') {
                var appType = itemIDToAppType(itemID);
                if (appType && appType == 'basic') {
                    break;
                }
            }
        }
    }

    // check if contract line contains Basic or Deluxe item
    var itemID = nlapiGetFieldValue('custrecord_cl_item');
    log(show, where, 'itemID=' + itemID);

    //if (itemID == '38' || itemID == '39' || itemID == '44' || itemID == '45' || itemID == '89' || itemID == '90') {
    if (isBasicDeluxeOrProApp(itemID)) {
        log(show, where, 'itemID=' + itemID + ' on this contract line');

        //soItemFlag = itemID;
        newAppEdition = itemID;
    }

    var prevAppType = itemIDToAppType(prevAppEdition);
    var newAppType = itemIDToAppType(newAppEdition);
    log(show, where, 'prevAppEdition=' + prevAppEdition + ', prevAppType=' + prevAppType + ', newAppEdition=' + newAppEdition + ', newAppType=' + newAppType);

    // if the above two conditions are true, then set the Basic or Deluxe item to inactive
    /*
     if (((soItemFlag == '39' || soItemFlag == '38') && (itemFlag == '44' || itemFlag == '45')) ||
     ((soItemFlag == '44' || soItemFlag == '45') && (itemFlag == '39' || itemFlag == '38')) ||
     (soItemFlag == '90' && (itemFlag == '44' || itemFlag == '45')) ||
     (soItemFlag == '90' && (itemFlag == '39' || itemFlag == '38')) ||
     (soItemFlag == '89' && (itemFlag == '44' || itemFlag == '45')) ||
     ((soItemFlag == '44' || soItemFlag == '45') && itemFlag == '89') ||
     (soItemFlag == '89' && (itemFlag == '39' || itemFlag == '38')) ||
     ((soItemFlag == '39' || soItemFlag == '38') && (itemFlag == '44' || itemFlag == '45'))) {
     */
    if (appEditionHasChanged(prevAppEdition, newAppEdition)) {

        log(show, where, 'inactivating');

        var contractLineItems = nlapiSearchRecord('customrecord_contractline', null, filters, columns);

        for (var j = 0; contractLineItems != null && j < contractLineItems.length; j++) {
            upgradeFlag = 1;

            var lineItem = contractLineItems[j];
            var lineItemID = lineItem.getId();
            var itemID = lineItem.getValue('custrecord_cl_item');
            var lineItemPrice = lineItem.getValue('custrecord_cl_price');
            var lostRevenueDate = lineItem.getValue('custrecord_cl_lostrevenuedate');
            log(show, where, 'contract line item index=' + j + ', lineItemPrice=' + lineItemPrice + ', lostRevenueDate=' + lostRevenueDate);

            //if (itemID == itemFlag) {
          //hardcoding of itemId 596 exception as per INS-314 mmarkowitz/dsmith 1/24/14
            if (itemID == prevAppEdition && itemID != '596') {
                log(show, where, 'inactivating lineItemID=' + lineItemID);

                log(show,'custrecord_cl_cancelled','$$$$$$$$$$$$$$$$$$$$  341');
                nlapiSubmitField('customrecord_contractline', lineItemID, 'custrecord_cl_cancelled', 'T');

                var date = new Date();
                var day = date.getDate();
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var dateStr = month + "/" + day + "/" + year;

                // check if it is a downgrade; if so, then set lost revenue value
                /*
                 log(show, where, 'itemFlag=' + itemFlag + ', soItemFlag=' + soItemFlag);

                 if (!(((itemFlag == '39' || itemFlag == '38') && (soItemFlag == '44' || soItemFlag == '45')) ||
                 ((itemFlag == '39' || itemFlag == '38') && (soItemFlag == '89' || soItemFlag == '90')) ||
                 ((itemFlag == '44' || itemFlag == '45') && (soItemFlag == '89' || soItemFlag == '90')))) {
                 */
                log(show, where, 'prevAppEdition=' + prevAppEdition + ', newAppEdition=' + newAppEdition);

                if (isAppEditionDowngrade(prevAppEdition, newAppEdition)) {
                    var currLineItemID = nlapiGetRecordId();

                    if (TYPE != 'delete' && lineItemID != currLineItemID) {
                        if (!lostRevenueDate) {
                            nlapiSubmitField('customrecord_contractline', lineItemID, 'custrecord_cl_lostrevenuedate', dateStr);
                            log(show, where, 'set contract line LRD (dateStr)=' + dateStr);
                        }

                        nlapiSubmitField('customrecord_contractline', lineItemID, 'custrecord_cl_lostrevenuevalue', lineItemPrice);
                        log(show, where, 'set contract line LRV (lineItemPrice)=' + lineItemPrice);
                    }
                }
            }
        }
    }

    log(show, where, '********* end **********');

    return upgradeFlag;
}

function setLRVForNegativeUsers(contractID) {
    var where = 'setLRVForNegativeUsers';
    var show = true;
    log(show, where, '********* start **********');

    var contractLineID = nlapiGetRecordId();

    var quantity = parseInt(nlapiGetFieldValue('custrecord_cl_qty'));
    var price = parseInt(nlapiGetFieldValue('custrecord_cl_price'));

    var lostRevenueValue = -(quantity * price);

    if (quantity < 0) {
        var lostRevenueFields = new Array();
        var lostRevenueValues = new Array();

        lostRevenueFields.push('custrecord_cl_lostrevenuevalue');
        lostRevenueValues.push(lostRevenueValue);

        var lostRevenutDate = nlapiGetFieldValue('custrecord_cl_lostrevenuedate');
        if (!lostRevenutDate) {
            lostRevenueFields.push('custrecord_cl_lostrevenuedate');

            var today = new Date();
            var currMonth = today.getMonth() + 1;
            var currDate = today.getDate();
            var currYear = today.getFullYear();

            lostRevenueValues.push(currMonth + "/" + currDate + "/" + currYear);
        }

        nlapiSubmitField('customrecord_contractline', contractLineID, lostRevenueFields, lostRevenueValues);
    }

    log(show, where, '********* end **********');
}

function zeroRevenueValueIfAllLinesCancelled(contractID) {
    var where = 'zeroRevenueValueIfAllLinesCancelled';
    var show = true;
    log(show, where, '********* start **********');

    var filters = new Array();
    filters.push(new nlobjSearchFilter('custrecord_cl_contract', null, 'anyof', contractID));

    var columns = new Array();
    columns.push(new nlobjSearchColumn('custrecord_cl_cancelled'));

    var contractLineItems = nlapiSearchRecord('customrecord_contractline', null, filters, columns);

    var allLinesCancelled = true;

    for (var i = 0; contractLineItems != null && i < contractLineItems.length; i++) {
        var cancelled = contractLineItems[i].getValue('custrecord_cl_cancelled');
        if (cancelled == 'F') {
            allLinesCancelled = false;
            break;
        }
    }
    log(show, where, 'contractID=' + contractID + 'allLinesCancelled=' + allLinesCancelled);
    if (contractLineItems != null && contractLineItems.length && allLinesCancelled) {
        log(show, where, 'About to change the recurring value to 0.');
        var revenueValue = 0;
        nlapiSubmitField('customrecord_contract', contractID, 'custrecord_c_recurringvalue', revenueValue);
    }

    log(show, where, '********* end **********');
}

function dateObjAsStr(dateObj) {
    var month = dateObj.getMonth() + 1;
    var day = dateObj.getDate();
    var year = dateObj.getFullYear();

    return month + "/" + day + "/" + year;
}

function log(show, where, what) {
    if (where == null) {
        where = '';
    } // we want to pass a function name for a "where"
    if (what == null) {
        what = '';
    } // we want to pass a specific message for a "what"
    if (show) {
        nlapiLogExecution('debug', where, what);
        //console.log('debug : ' + where + ' : ' + what);
    }
}