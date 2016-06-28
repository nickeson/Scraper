/** 
 * loads the SMT video player JS file.  
 * Done here, once, so multiple videos on one page don't duplicate efforts. (this file gets cached once loaded once)
 * JM 03.28.14
 **/
function loadSMTVideoPlayer(video) {
	$.ajaxSetup({ cache : true });  //allow files to be cached by the browser
	$.getScript("/binary/common/scripts/videoPlayer/VideoPlayer.js", function() {
		setupVideoPlayer(video);
	});
	$.ajaxSetup({ cache : false }); //restore default setting for jquery
}

//triggers printerFriendlyTheme into a new window.
//Includes all query string params on the current URL except for the reserved two.
function printPage(hidePf) {
	url = window.location.search;
	url = url.replace(/[&|\?]?printerFriendlyTheme=[a-zA-Z]*/g, "");
	url = url.replace(/[&|\?]?hidePf=[a-zA-Z]*/g, "");
	url = url.replace(/[&|\?]?showTextSize=[a-zA-Z]*/g,""); //when we actually call to print (from a shadowbox) don't show the print icons.
	url += "&printerFriendlyTheme=true";
	if (hidePf) url += "&hidePf=true";
	if (url.charAt(0) == "&") url = url.substring(1);
	if (url.indexOf("?") == -1) url = "?" + url;
	openSite(window.location.pathname + url,null,null,null);
}

//Sends the request to the server and updates the appropriate object
function sendRequest(serverPage, objID, type, callBack) {
	//call the SMTHttpRequest Object
	new SMTHttpRequest().sendRequest(serverPage, objID, type, callBack);
}

// Loops though form elements and creates a GET URL
function sendFormRequest(theForm, objID, type, callBack) {
	var url = theForm.action + "?1=1";
	for (var i=0; i< theForm.elements.length; i++) {
		if(theForm.elements[i].name.length > 0) {
			url += "&" + theForm.elements[i].name + "=" + theForm.elements[i].value;
		}
	}
	sendRequest(url, objID, type, callBack);
}

// Refreshes state select list
function resetStateSelect(url, countryCode, theSelectField, defaultOptionText, defaultSelected) {
		if (theSelectField == null) return;
		var selObject = new Object();
		selObject.selectField = theSelectField;
		if (defaultOptionText == null) defaultOptionText = '';
		selObject.defaultOptionText = defaultOptionText;
		selObject.selectedOption = defaultSelected;
		selObject.callBack = new SMTFormUtil().setSelectOptions;
				
		if (countryCode == null || countryCode == '') {
			selObject.responseText = '';
			new SMTFormUtil().setSelectOptions(selObject);
		} else {
			url = url + countryCode;
			new SMTHttpRequest().cacheRequest(url, selObject);
		}
}

function autoGrowField(f) {
   scrollH = f.scrollHeight+'px';
   if(f.style.height != scrollH){
      f.style.height = scrollH;
   }
}

function changeFontSize(size) {
	var url = window.location.href;
	url = url.replace(/[&]?fontSize=[0-9]/g, "");
	hash = "";
	if (url.indexOf("#") > 0) {
		hash = url.substring(url.indexOf("#"));
		url = url.substring(0, url.indexOf("#"));
	}
	qMrk = url.indexOf("?");
	if (qMrk > 0 && qMrk+1 < url.length) {
		url += "&";
	} else if (qMrk < 0) {
		url += "?";
	}
	window.location = url + "fontSize=" + size + hash;
}

function externalLinks() {
	if (!document.getElementsByTagName) return;
	var anchors = document.getElementsByTagName("a");
	for (var i=0; i<anchors.length; i++) {
		var anchor = anchors[i];
		if (anchor.getAttribute("href") && anchor.getAttribute("rel") == "external")
			anchor.target = "_blank";
	}
}

//simple URL parameter getter method.
function getURLParam(paramNm) {
	var strReturn = "";
	var strHref = window.location.href;
	if (strHref.indexOf("?") == -1 ) return strReturn;

	var qs = strHref.substr(strHref.indexOf("?"));
	var qsArr = qs.split("&");
	for (var x=0; x < qsArr.length; x++ ) {
		if (qsArr[x].indexOf(paramNm + "=") > -1 ) {
			var param = qsArr[x].split("=");
			strReturn = param[1];
			break;
		}
	}
	return decodeURIComponent(strReturn);
} 

// Checks to ensure all values are filled out and submits the form
function submitElement(theForm, message) {
	if (checkVals(theForm, message)) {
		theForm.submit();
	} else {
		return false;
	}
}

//Checks to ensure all values are filled out and submits returns a true or false
function checkElementWithConfim(theForm, message) {
	if (checkVals(theForm, message)) {
		return confirm("Are you sure you want to submit this information?");
	} else {
		return false;
	}
}

// Checks to ensure all values are filled out and submits the form
function submitContact(theForm, message, commJS) {
	var cs = theForm.collectionStatement;
	if (cs != null)	{
		if (cs.checked == false) {
			alert(commJS);
			return false;
		}
	}
	
	cs = theForm.orgConsentStatement;
	if (cs != null) {
		if (cs.checked == false) {
			alert(commJS);
			return false;
		}
	}
	
	if (checkVals(theForm, message)) {
		//require a valid email address if this field is present on the form (and required)
		try {
			if (theForm.pfl_EMAIL_ADDRESS_TXT != null 
					&& theForm.pfl_EMAIL_ADDRESS_TXT.id.length > 0 
					&& (theForm.pfl_EMAIL_ADDRESS_TXT.id.charAt(0) != '~')
					&& !checkEmail(theForm.pfl_EMAIL_ADDRESS_TXT.value)) {
				alert(message + " \"" + theForm.pfl_EMAIL_ADDRESS_TXT.id.replace(/_/g, " ") + "\"");
				return false;
			}
		} catch (Err) {}
		
		theForm.submit();
	} else {
		return false;
	}
}

//Checks to ensure all values are filled out and submits the form.
//Performs same action as the submitContact function only it uses new FormAction
//pfl_ based fields for collection and org Consent Statements.
function submitForm(theForm, message, commJS) {
	var cs = theForm.pfl_collectionStatement;
	if (cs != null)	{
		if (cs.checked == false) {
			alert(commJS);
			return false;
		}
	}

	cs = theForm.pfl_orgConsentStatement;
	if (cs != null) {
		if (cs.checked == false) {
			alert(commJS);
			return false;
		}
	}

	if (checkVals(theForm, message)) {
		//require a valid email address if this field is present on the form (and required)
		try {
			if (theForm.pfl_EMAIL_ADDRESS_TXT != null
					&& theForm.pfl_EMAIL_ADDRESS_TXT.id.length > 0
					&& (theForm.pfl_EMAIL_ADDRESS_TXT.id.charAt(0) != '~')
					&& !checkEmail(theForm.pfl_EMAIL_ADDRESS_TXT.value)) {
				alert(message + " \"" + theForm.pfl_EMAIL_ADDRESS_TXT.id.replace(/_/g, " ") + "\"");
				return false;
			}
		} catch (Err) {}

		theForm.submit();
	} else {
		return false;
	}
}

/**
 * when the user wants to use the 'forgot password' feature of the login portlet, 
 * force them through the action's build method so that the referring page can
 * be captured properly (redirectUrl).  If not, we'll undesireably redirect them 
 * back to the forgot password screen after login.
 * @param formEleId
 */
function forgotPassword(formEleId) {
	var form = document.getElementById(formEleId);
	form.reqType.value = "forgotPassword";
	form.submit();
}

// Checks to ensure all values are filled out and submits the form
// owned by REGISTRATION module
// TODO: add JS validation to fields based on attribute, validation=""
function submitRegistration(theForm, message, commJS, passwordJS, pwdComplexity) {
	if (!checkVals(theForm, message)) return false;
	
	var passwd = theForm.elements["Password"];
	if (passwd != null) {
		// check for complexity
		if (! validateComplexity(passwd.value, pwdComplexity)) return false;
		var passwd2 = theForm.elements["PasswordConfirm"];
		if (passwd2 == null || passwd.value == "" || passwd.value != passwd2.value) {
			alert(passwordJS);
			return false;
		}
	}
	
	var cs = theForm.elements["COMMCONSENTFLG"];
	if (cs != null)	{
		if (cs.checked == false) {
			alert(commJS);
			return false;
		}
	} else {
		cs = theForm.elements["COLLECTIONFLG"];
		if (cs != null)	{
			if (cs.checked == false) {
				alert(commJS);
				return false;
			}
		}
	}
	
	theForm.submit();
}

// Checks the Form Elements that have an ID and makes sure the field 
//has data associated
var skipIds = Array();
	skipIds["COMMCONSENTFLG"] = 0;
	skipIds["Password"] = 0;
	skipIds["PasswordConfirm"] = 0;

var formElements = ["email", "number", "text","textarea","hidden", "select-one","select-multiple","radio","checkbox", "file","button","submit","reset","password"];
function checkVals(theForm, message) {
	for (i=0; i < theForm.elements.length; i++) {
		var promptUser = false;
		node = theForm.elements[i];
		
		//ensure only form fields are examined.  The old way was tripping over <fieldset>, likely others.  -JM 01-21-14
		if (! smtArrayContains(formElements, node.type)) continue;
		
		if (node.id != null && node.id != "" && node.id.charAt(0) != "~") { //~ lets a field that has an id skip validation
			//this test allows checkVals to bypass certain form fields, allowing the parent 
			//method to do other things with them
			if (node.id in skipIds) continue;
			
			// Check the radio buttons for a value selected
			if (node.type == "radio" || node.type == "checkbox") {
				fields = theForm[node.name];
				radioSet = false;
				
				// If there is only one element to the radio button, check it
				// like a normal field otherwise loop the elements
				if (fields.length == undefined) {
					radioSet = (fields.checked);
				} else {
					for (j=0; j < fields.length; j++) {
						if (fields[j].checked) {
							radioSet = true;
							break;
						}
					}
				}
				
				promptUser = (!radioSet);
				
			} else {
				promptUser = (node.value == null || node.value == "");
			}
			
			// Display a message to the user that required elements are not filled out
			if (promptUser) {
				var fieldNm = node.id.replace(/_/g, " ");  //replace word separators
				fieldNm = fieldNm.replace(/<[^>]*>/g," "); //strip HTML
				fieldNm = fieldNm.replace(/&nbsp;/g," ");  //strip &nbsp;
				
				smtAlert(message + " \"" + fieldNm + "\"");
				try { node.focus(); } catch (err) { /*this is known to fail in older browsers (IE8) if the node is hidden/invisible.*/ }
				return false;
			}
		}
	}
	
	//assert that form validation has been performed
	appendValidation(theForm, null);
	
	return true;
}
/**
 * masquerades the call to alert().  This method allows us to override the method and supress alerts.
 * Intended Use: "save and continue" forms, where we want to leave the validate intact but still proceed with submission.
 * @param msg
 */
function smtAlert(msg) {
	alert(msg);
}

/**
 * a simple method to check for the existance of an element in an array.
 * Typically we'd used indexOf() for this, but IE 8 won't support it.
 * @param arr
 * @param val
 * @returns {Boolean}
 */
function smtArrayContains(arr, val) {
	return smtArrayIndexOf(arr, val) > -1;
}
function smtArrayIndexOf(arr, val) {
	if (Array.prototype.indexOf) return arr.indexOf(val);
	//fallback for IE <9.
	for (x=0; x < arr.length; x++) {
		if (arr[x] == val) return x;
	}
	return -1;
}

//This function appends a hidden form field to the form, which gives the server 
// some level of verification that a BROWSER actually processed the javascript before submitting the form.
var startTime = new Date().getTime();
function appendValidation(form, val) {
	if (form.elements['smt_formValidated']) return;
	
	var ele = document.createElement("input");
	ele.type = "hidden";
	ele.name = "smt_formValidated";
	ele.value = (val != null) ? val : ((new Date().getTime()) - startTime);
	form.appendChild(ele);
	return;
}

//Checks whether or not fields indcated with a validationType attribute
//have input that matches the validation type.
baseError = "This is not a proper ";
absError = "absolute URL.  Make sure it starts with http://, https://, or //";
relError = "relative URL.  Make sure it starts with a /";
urlError = "url.  Make sure it begins with either a protocol (http://, https://, or //), or a slash (/)";
emailError = "email address.  Make sure it fits the format of *****@****.***";

function validateInputs(theForm) {
	for (i=0; i < theForm.elements.length; i++) {
		var success = false;
		node = theForm.elements[i];
		type = node.getAttribute("validationType");
		if (node.value != null && node.value != "" && type != null && type != "") {
			switch (type) { 
			case "absUrl":
				success =  checkAbsUrl(node.value);
				thisErrorMessage = baseError+absError;
				break;
			case "relUrl":
				success = checkRelUrl(node.value);
				thisErrorMessage = baseError+relError;
				break;
			case "url":
				success = (checkAbsUrl(node.value) || checkRelUrl(node.value));
				thisErrorMessage = baseError+urlError;
				break;
			case "email":
				success = checkEmail(node.value);
				thisErrorMessage = baseError+emailError;
				break;
			}
			if (!success) {
				alert(thisErrorMessage);
				node.focus();
				return false;
			}
		}
	}
	return true;
}

/* Absolute url validator */
function checkAbsUrl(str) {
	var filter = /^((http){1}s{0,1}:\/\/|(\/\/){1})/;
	return (filter.test(str));  //returns true if valid, false if not
}

/* Relative url validator */
function checkRelUrl(str) {
	var filter = /^(\/{1}[a-zA-Z0-9\-_\.%!#\$&\'\"\(\)\*\+,:;=@\[\]]*)/;
	return (filter.test(str));  //returns true if valid, false if not
}

// Shows and hides the appropriate elements.
// theEle - <a> tag which has the call to this method.  Can usually use
//          The word "this" in the call
// which - element to hide/show.  Usually document.getElementById(val)
function toggleElement(theEle) {
	var which = fetch_object(theEle);
	if (which.style.display == "none")	{
		which.style.display = "";
	} else {
		which.style.display = "none";
	}
}
function toggleElementCtrl(theEle, showIt) {
	var which = fetch_object(theEle);
	if (showIt)	{
		which.style.display = "";
	} else {
		which.style.display = "none";
	}
}

// Activates the single element and accepts an array of IDs to be turned off
function toggleSet(theEle, offArray) {
	var which = fetch_object(theEle);
	which.style.display = "";
	
	for (i=0; i < offArray.length; i++) {
		var offArr = document.getElementById(offArray[i]);
		offArr.style.display = "none";
	} 
}

// same as admin JS toggleView function
function toggleView(theEle, which) {
	if (which.style.display == "none")	{
		which.style.display = "";
		document.getElementById(theEle.id).innerHTML = "-";
	} else {
		which.style.display = "none";
		document.getElementById(theEle.id).innerHTML = "+";
	}
}

function leaveSite(site) {
	leaveSite(site,false);
}

function leaveSite(site, newWindow, height, width) {
	var notice = "This link will take you to a Web site to which this Privacy Policy does not apply. You are solely responsible for your interactions with that Web site. Press OK to continue.";
	if (confirm(notice)) {
		if (newWindow) window.open(site,"_blank");
		else if (newWindow != null) window.location = site;
		else {
			if (height == null) height = 300;
			if (width == null) width = 450;
			popup=window.open(site,'name','height=' + height + ',width=' + width);
			if (window.focus) {popup.focus();}
		}
	}
}

/* Opens the site in a new window with low control */
function openSite(site,width,height,style) {
	var newWindow = window.open(site,'mywindow');
}

/* Opens the site in a new window with high control */
function openContent(site,width,height,style) {
	var newWindow = window.open(site,'mywindow','width=' + width + ',height=' + height + ',menubar=' + style + ',status=no,scrollbars=yes');
}

/* Opens the site in a new window with total control */
function openContent(site,name,style) {
	if (name == null) name = "mywindow";
	var newWindow = window.open(site, name, style);
}

/* email validator */
function checkEmail(str) {
	//var filter  = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})$/; -JM replaced 10.27.15 w/below, matches StringUtil
	var filter  = /^([a-zA-Z0-9_'\.\-!#\$%&'\*\+/=\?\^_`\{\|\}~])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,20})$/;
	return (filter.test(str));  //returns true if valid, false if not
}

//returns number-only equivellent of string passed (strips all non-numerics)
function parseInteger(field) {
	var length1 = field.length;
	var val = "";
	for (i=0; i < length1; i++) {
		val = field.charCodeAt(i);
		if (!(val > 47 && val < 58)) {
			field = field.replace(field.charAt(i), "");
			i = i - 1;
			length1 = length1 - 1;
		}
	}
	return field;
}

// function to emulate document.getElementById
function fetch_object(idname) {
	if (document.getElementById) {
		return document.getElementById(idname);
	
	} else if (document.all) {
		return document.all[idname];
	
	} else if (document.layers) {
		return document.layers[idname];

	} else {
		return null;
	}
}

function searchSite(form, msg) {
	var data = form.searchData.value;
	if (data == "") {
		alert(msg);
	} else {
		// Check if this is a google search.
		// If so we do not encode the search query in order to ensure all characters get though to google.
		if (form.elements['q']) {
			form.elements['searchField'].value = data;
		} else {
			form.elements['searchField'].value = encodeURIComponent(data);
		}
		form.submit();
	}
}

// displays the current section of the docuemnt and turns the others off
function changePage(pageNum, numPages) {
	for (i=1; i <= numPages; i++)	{
		var id = "page" + i;
		try {
			var obj = fetch_object(id);
			if (i == pageNum) {
				obj.style.display="block";
			} else {
				obj.style.display="none";
			}
		} catch (err) {}
	}
}

// Shows and hides the appropriate elements.
// theEle - <a> tag which has the call to this method.  Can usually use
//          The word "this" in the call
// which - element to hide/show.  Usually document.getElementById(val)
function toggleMapElement(disp, theEle, show, hide) {
	var which = fetch_object(theEle);
	if (which.style.display == "none")	{
		document.getElementById(disp.id).innerHTML = hide;
		which.style.display = "";
	} else {
		which.style.display = "none";
		document.getElementById(disp.id).innerHTML = show;
	}
}

// Assigns the selected ambiguity to the form
function assignAmb(theForm, type, addr, city, state, zip) {
	theForm[type + "Address"].value = addr;
	theForm[type + "City"].value = city;
	theForm[type + "StateProvince"].value = state;
	theForm[type + "PostalCode"].value = zip;
}

// Assigns a specific lat/long
function assignLatLong(theForm, type, latitude, longitude) {
	if (theForm.useMapLoc.checked) {
		theForm[type + "Latitude"].value = latitude;
		theForm[type + "Longitude"].value = longitude;
	} else {
		theForm[type + "Latitude"].value = "";
		theForm[type + "Longitude"].value = "";
	}
}

// Checks or unchecks boxes in the supplied ele
function checkAllBoxes(ele, on, otherEle) {
	if (ele.length == null) ele.checked = on;
	
	for(i=0; i < ele.length; i++) {
		ele[i].checked = on;
	}
	
	if (otherEle != null) {
		otherEle.checked = on;
		showOptOutOther(otherEle.checked);
	}

}
function showOptOutOther(boolChecked) {
	var otherBox = document.getElementById("optOutOther");
	if (boolChecked) {
		otherBox.style.visibility = "hidden";	
		otherBox.style.display = "none";		
	} else {
		otherBox.style.visibility = "visible";
		otherBox.style.display = "block";				
	}
}


// Checks or unchecks boxes in the supplied ele
function toggleAllBoxes(ele) {
	for(i=0; i < ele.length; i++) {
		if(ele[i].checked) {
			ele[i].checked = false;
		} else {
			ele[i].checked = true;
		}
	}

}

// Checks a string value to determine if it is
// formatted as a valid date.
function isDate(sDate) {
	if (! Date.parse(sDate)) {
		return false;
	} else {
		return true;
	}
}

// Parses a string into a slash-pattern date and validates the month/day/year ranges.
// Accommodates a date string in 'slashed' (MM/DD/YYYY) or non-slashed (MMDDYYYY).
// format.  Returns either a zero-length String or the valid date in slash-pattern (MM/DD/YYYY)
// formatted String.
function parseDate(inDate) {
	var returnedDate = '';
	var dateLength = inDate.length;

	if (dateLength < 6 || dateLength > 10) {
		return returnedDate;
	}
		
	var firstSlash = inDate.indexOf('/');
	var lastSlash = 0;
	var month = 0;
	var day = 0;
	var year = 0;
	
	if (firstSlash > 0) {
		
		lastSlash = inDate.lastIndexOf('/');
		month = parseInt(inDate.substr(0,firstSlash), 10);
		day = parseInt(inDate.substring((firstSlash + 1),lastSlash), 10);
		year = parseInt(inDate.substring(lastSlash + 1), 10);
		
	} else {
		
		switch(dateLength) {
			case(6):
				month = parseInt(inDate.substr(0,1), 10);
				day = parseInt(inDate.substr(1,1), 10);
				break;
			case(7):
				month = parseInt(inDate.substr(0,2), 10);
				day = parseInt(inDate.substr(2,1), 10);
				break;
			case(8):
				month = parseInt(inDate.substr(0,2), 10);
				day = parseInt(inDate.substr(2,2), 10);
				break;
		}
		
		year = parseInt(inDate.substring((dateLength - 4)), 10);
			
	}
	
	if (isNaN(year) || (year < 1970) || (year > 2100)) {
		return returnedDate;
	}
	
	if (isNaN(month) || (month < 1) || (month > 12)) {
		return returnedDate;
	}
	
	var leapYear = false;
	
	if (year % 4 == 0) {
		if (year % 100 == 0) {
			if (year % 400 == 0) {
				leapYear = true;
			}
		} else {
			leapYear = true;
		} 
	}
	
	if (isNaN(day) || (day < 1)) {
		return returnedDate; 
	} else {
		switch(month) {
			case(1):
			case(3):
			case(5):
			case(7):
			case(8):
			case(10):
			case(12):
				if (day > 31) {
					return returnedDate;
				}
				break;
			case(4):
			case(6):
			case(9):
			case(11):
				if (day > 30) {
					return returnedDate;
				}
				break;
			case(2):
				if (leapYear && (day > 29)) {
					return returnedDate;
				} else {
					if (day > 28) {
						return returnedDate;
					}
				}
				break;
		}
	}	
	
	returnedDate = month + "/" + day + "/" + year;
	return returnedDate;
	
}

// Looks up the appropriate style and gets the background color
function getColor(val) {
	var color = "";
	var mysheet=document.styleSheets[0];
	var rules = mysheet.cssRules ? mysheet.cssRules : mysheet.rules;
	var totalrules=mysheet.cssRules? mysheet.cssRules.length : mysheet.rules.length;
	
	for (i=0; i < totalrules; i++) {
		var myText = rules[i].selectorText.toLowerCase();
		if (myText.indexOf(val.toLowerCase()) > -1) color = rules[i].style.backgroundColor;
	}
	
	return(color);
}

//email-a-friend form expandability
var lastRow = 2;
var fileNum = 1;
function addRecipient(context, name, email, ele, rowNo) {
	tempNm = name;
	tempEmail = email;
	if (name.indexOf('apos') > -1) {
		tempNm = name.replace('apos','&#39;');
	}
	if (email.indexOf('apos') > -1) {
		tempEmail = email.replace('apos','&#39;');
	}
	fileNum = rowNo-1;
	var newRowId = "row-" + rowNo;
	var row = ele.insertRow(rowNo);
		row.id = newRowId;
		row.className = "smallRow";
	var cell1 = row.insertCell(0);
		cell1.innerHTML = tempNm + ":"; //name label
		cell1.className ="sForm";
	var cell2 = row.insertCell(1);
		cell2.innerHTML = "&nbsp;"; //spacer
	var cell3 = row.insertCell(2);
		cell3.innerHTML = "<input type='text' name='rcptNm' class='emailFriendField'/>"; //name field
		cell3.className ="form-ele";
	var cell4 = row.insertCell(3);
		cell4.innerHTML = "&nbsp;"; //spacer
	var cell5 = row.insertCell(4);
		cell5.innerHTML = tempEmail + ":"; //email label
		cell5.className ="sForm";
	var cell6 = row.insertCell(5);
		cell6.innerHTML = "&nbsp;"; //spacer
	var cell7 = row.insertCell(6);
		cell7.innerHTML = "<input type='text' name='rcptEml' class='emailFriendField'/>"; //email field
		cell7.className ="form-ele";
	var cell8 = row.insertCell(7);
		cell8.innerHTML = "<a style=\"font-weight:bold; text-decoration:none;\" href=\"javascript:removeRecipient(fetch_object('emailTable'),'" + newRowId + "');\">X</a>"; //delete icon
	return;
}
function removeRecipient(ele, rowId) {
	for (x=0; ele.rows[x] != null; x++) {
		if (ele.rows[x].id == rowId) {
			ele.deleteRow(x);
			lastRow--;
			break;
		}
	}
	return;
}

//Email-a-Friend form VERTICAL expansion
var lastRowVertical = 4;
var fileNumVertical = 1;
function addRecipientVertical(context, name, email, ele, rowNo) {
	tempNm = name;
	tempEmail = email;
	if (name.indexOf('apos') > -1) {
		tempNm = name.replace('apos','&#39;');
	}
	if (email.indexOf('apos') > -1) {
		tempEmail = email.replace('apos','&#39;');
	}
	fileNumVertical++;
	var newRowId = "row-" + rowNo;
	var row = ele.insertRow(rowNo);
		row.id = newRowId;
		row.className = "smallRow";
	var cell1 = row.insertCell(0);
		cell1.innerHTML = tempNm + ":"; //name label
		cell1.className ="sForm";
	var cell2 = row.insertCell(1);
		cell2.innerHTML = "&nbsp;"; //spacer
	var cell3 = row.insertCell(2);
		cell3.innerHTML = "<input type='text' name='rcptNm' class='emailFriendField'/>"; //name field
		cell3.className ="form-ele";
	var cell4 = row.insertCell(3);
		cell4.innerHTML = "<a style=\"font-weight:bold; text-decoration:none;\" href=\"javascript:removeRecipientVertical(fetch_object('emailTable'),'" + newRowId + "');\">X</a>"; //delete icon
		rowNo++;
		lastRowVertical++;
		newRowId = "row-" + rowNo;
	var row1 = ele.insertRow(rowNo);
		row1.id = newRowId;
		row1.className="smallRow";
	var cell1 = row1.insertCell(0);
		cell1.innerHTML = tempEmail + ":"; //email label
		cell1.className ="sForm";
	var cell2 = row1.insertCell(1);
		cell2.innerHTML = "&nbsp;"; //spacer
	var cell3 = row1.insertCell(2);
		cell3.innerHTML = "<input type='text' name='rcptEml' class='emailFriendField'/>"; //email field
		cell3.className ="form-ele";
	var cell4 = row1.insertCell(3);
		cell4.innerHTML = "&nbsp;"; //spacer
	return;
	lastRowVertical++;
}

//Email-a-Friend form VERTICAL recipient removal
function removeRecipientVertical(ele, rowId) {
	for (x=0; ele.rows[x] != null; x++) {
		if (ele.rows[x].id == rowId) {
			for (y=0; y<2; y++) {
				ele.deleteRow(x);
				lastRowVertical--;
			}
			break;
		}
	}
	return;
}

//Clears form fields, including select lists.
// Based on example from http://www.javascript-coder.com/javascript-form/javascript-reset-form.htm
function clearForm(theForm) {
	var ele = theForm.elements;
	
	for (i = 0; i < ele.length; i++) {
		var eleType = ele[i].type.toLowerCase();
		
		switch(eleType) {
			case "text":
			case "textarea":
				ele[i].value = "";
				break;
			
			case "radio":
			case "checkbox":
				if (ele[i].checked) {
					ele[i].checked = false;
				}
				break;
				
			case "select-one":
			case "select-multi":
				ele[i].selectedIndex = -1;
				break;
				
			default:
				break;
		}
	}
}

// used in delete form to alert the user to the delete and to change the 
// request type to delete
function deleteElement(theForm, type) {
	var choice = confirm("Are you sure you want to delete the " + type + " element?");
	if (choice) {
		theForm.requestType.value = "reqDelete";
		theForm.submit();
	}
}

/* PSP site graphical menu support */
function MM_preloadImages() { //v3.0
  var d=document; if(d.images){ if(!d.MM_p) d.MM_p=new Array();
    var i,j=d.MM_p.length,a=MM_preloadImages.arguments; for(i=0; i<a.length; i++)
    if (a[i].indexOf("#")!=0){ d.MM_p[j]=new Image; d.MM_p[j++].src=a[i];}}
}

function MM_swapImgRestore() { //v3.0
  var i,x,a=document.MM_sr; for(i=0;a&&i<a.length&&(x=a[i])&&x.oSrc;i++) x.src=x.oSrc;
}

function MM_findObj(n, d) { //v4.01
  var p,i,x;  if(!d) d=document; if((p=n.indexOf("?"))>0&&parent.frames.length) {
    d=parent.frames[n.substring(p+1)].document; n=n.substring(0,p);}
  if(!(x=d[n])&&d.all) x=d.all[n]; for (i=0;!x&&i<d.forms.length;i++) x=d.forms[i][n];
  for(i=0;!x&&d.layers&&i<d.layers.length;i++) x=MM_findObj(n,d.layers[i].document);
  if(!x && d.getElementById) x=d.getElementById(n); return x;
}

function MM_swapImage() { //v3.0
  var i,j=0,x,a=MM_swapImage.arguments; document.MM_sr=new Array; for(i=0;i<(a.length-2);i+=3)
   if ((x=MM_findObj(a[i]))!=null){document.MM_sr[j++]=x; if(!x.oSrc) x.oSrc=x.src; x.src=a[i+2];}
}

function addLoadEvent(func) {
  addEvent(window, 'load', func);
}

// allows multiple functions to be executed upon window.load without conflict
// author: Chris Heilmann; http://onlinetools.org/articles/unobtrusivejavascript/chapter4.html
function addEvent(obj, evType, fn) { 
	 if (obj.addEventListener){ 
	   obj.addEventListener(evType, fn, false); 
	   return true; 
	 } else if (obj.attachEvent) { 
	   var r = obj.attachEvent("on"+evType, fn); 
	   return r; 
	 } else { 
	   return false; 
	 } 
}


//This function is used to submit an element when a specific key is pressed.
//e is the event, in this case a key press
//cList is the key values you want to act upon.
function checkKey(e, cList) {
    var keynum; // set the variable that will hold the number of the key that has been pressed.
    var keyCheck = new Array(); //set the variable that will hold our watch values.
    //now, set keynum = the keystroke that we determined just happened...
	if (e.which == null) {
		if (e.keyCode > 33) {
			keynum = String.fromCharCode(e.keyCode); // IE
		} else {
	    	keynum = e.keyCode;
		}
	} else if (e.which != 0) {
		keynum =  e.which;
	} else {
		keynum =  0; // special key
	}
	
    //capture values into array format.
    keyCheck = cList.split(',');
    
    //convert array to ascii codes.
    for(i in keyCheck) 
	   keyCheck[i] = new String(keyCheck[i]).charCodeAt(0);

    // now that keynum is set, interpret keynum
    for(i in keyCheck)
    	if (keynum == keyCheck[i]) // Check if the event is in our watch list.
    		return true;
    //we have not pressed one of our target keys.
    return false;
}

/** 3 methods for using Javascript cookies easily **/
function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toUTCString();
	}
	else var expires = "";
	document.cookie = name+"="+escape(value)+expires+"; path=/";
}
function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}
function eraseCookie(name) {
	createCookie(name,"",-1);
}


/******************* SMT DYNAMIC STATE/COUNTRY LIST OBJECT *******************/
function SMTDynStateList(ctx) {
	var mySmtDynStateList = this; //add a reference to this Object to the DOM, for onChange callbacks
	this.ctx = ctx;
	this.stateUrl = function() { return "/" + this.ctx + "/json?listType=state&countryCode="; };
	this.countryUrl = function() { return "/" + this.ctx + "/json?listType=country"; };
	this.defaultText = "Choose country first...";
	this.countryFieldId = null;
	this.stateFieldId = null;
	this.countryCd = null;
	this.stateCd = null;
	this.useFirstOption = false;
	this.firstOptionLabel = "";
	this.firstOptionValue = "";
	this.useAbbr = false;
	this.getStateObj = function() {  return document.getElementById(this.stateFieldId); };
	this.getCountryObj = function() {  return document.getElementById(this.countryFieldId); };
	this.selectPopulatedCallBack = null;
	
	this.init = function() {
		//give onChange instructions to the Country dropdown
		if (this.countryFieldId != null) {
			this.getCountryObj().onchange = function() {
				mySmtDynStateList.setCountryCd(this);
			};
			if (this.getCountryObj().options.length == 0) {
				//populate a default list of countries
				this.populateCountrySelect();
			} else if (this.countryCd != null) {
				//pre-select the default
				new SMTFormUtil().setSelectedIndex(this.getCountryObj(), this.countryCd);
			}
		}
		
		//state will populate with the defaultText if no country is selected.
		if (this.stateFieldId != null) this.populateStateSelect();
	};
	
	//callback for Country's onChange
	this.setCountryCd = function(countryEle) {
		this.countryCd = countryEle.options[countryEle.selectedIndex].value;
		if (this.stateFieldId != null) this.populateStateSelect();
	};
	
	// populate the state list
	this.populateStateSelect = function() {
		so = new Object();
		so.selectField = this.getStateObj();
		so.defaultOptionText = this.defaultText;
		so.selectedOption = this.stateCd;
		so.useKey = this.useAbbr;
		so.callBack = new SMTFormUtil().setSelectOptions;
		
		if (this.countryCd == null || this.countryCd == '') {
			// no country, set the defaultText option
			so.responseText = '';
			so.callBack(so);
		} else {
			// retrieve country list
			if (this.useFirstOption) 	so.firstOption = this.firstOption();
			new SMTHttpRequest().cacheRequest(this.stateUrl()+this.countryCd, so);
		}
		
		if (this.selectPopulatedCallBack != null)
			this.selectPopulatedCallBack(this.stateFieldId);
	};
	// END populateStateSelect
	
	// populate country list
	this.populateCountrySelect = function() {
		co = new Object();
		co.selectField = this.getCountryObj();
		co.selectedOption = this.countryCd;
		co.callBack = new SMTFormUtil().setSelectOptions;
		co.useKey = this.useAbbr;
		if (this.useFirstOption || co.selectedOption == '') co.firstOption = this.firstOption();
		new SMTHttpRequest().cacheRequest(this.countryUrl(), co);

		if (this.selectPopulatedCallBack != null)
			this.selectPopulatedCallBack(this.countryFieldId);
	};
	// END populateCountrySelect
	
	this.firstOption = function() {
		return new Option(this.firstOptionLabel, this.firstOptionValue);
	};
}
/*****************  END SMT DYNAMIC STATE/COUNTRY LIST OBJECT *****************/

/*****************  SMT JAVASCRIPT HTTP OBJECT  *******************************/
function SMTHttpRequest() {
	//Type constants
	SMTHttpRequest.Types = { OBJ_INNERHTML : 1, OBJ_VALUE : 2, OBJ_RETURN_VAL : 3, OBJ_CALLBACK_OBJ : 4 };
	this.isASynchronous = true;
	this.method = "GET";
	this.acceptCacheData = true; //allow the browser to used previously cached response data
	this.error = null;
	this.postParams = null; //set method=POST when overriding this value
	
	// Creates the HTTP Object
	this.createRequestObject = function() {
	    var ro;
	    if (navigator.appName == "Microsoft Internet Explorer" && getInternetExplorerVersion() < 7){
	    	ro = new ActiveXObject("Microsoft.XMLHTTP");  //only used by IE < v7.0
	    } else if (navigator.appName == "Microsoft Internet Explorer" && getInternetExplorerVersion() < 10) {
	        ro = new ActiveXObject("Msxml2.XMLHTTP");  //used by IE versions older than 10
	    } else {
	        ro = new XMLHttpRequest();
	    }
	    return ro;
	};
	
	//do the heavy lifting
	this.sendRequest = function(url, objID, type, postProc) {
		
		//Enstantiate the HTTP Object
		var req = this.createRequestObject();
		
		//prepared the request
		req.open(this.method, url, this.isASynchronous);
		
		if (!this.acceptCacheData)
			req.setRequestHeader("Cache-Control", "no-cache");
		
		//define a monitor to watch for a response (from the server)
		req.onreadystatechange = function() {
			//request completed successfully:
			//NOTE: a "304 Not-Modified" response header will also have a status of 200:
			if (req.readyState == 4 && req.status == 200) {
				//support for isErrorResponse is unknown at the moment!
				//if (isErrorResponse(trim(req.responseText)))
				//		this.error = req.responseText;
				
				if (SMTHttpRequest.Types.OBJ_VALUE == type) {
					var obj = document.getElementById(objID);
					obj.value = req.responseText;
					
				} else if (SMTHttpRequest.Types.OBJ_INNERHTML == type) {
					var obj = document.getElementById(objID);
					obj.innerHTML = req.responseText;
					
				} else if (SMTHttpRequest.Types.OBJ_RETURN_VAL == type) {
					//postProc is a function.  call it and pass the responseText (String)
					//postProc.call(req.responseText);
					postProc.call(this, req.responseText);
				} else if (SMTHttpRequest.Types.OBJ_CALLBACK_OBJ == type) {
					// postProc is an Object with a 'callBack' method.  (we assume the method "callBack" exists!)
					// call the "postProc.callBack" method, passing a reference to the object that encapsulates it
					postProc.responseText = req.responseText;
					postProc.callBack(postProc);
				}
				
			} else if (req.readyState == 4 && req.status != 200) {
				//request completed but failed:
				this.error = req.getStatus + " " + req.statusText + ", " + req.responseText;
			}
		};
				
		//if the call is a POST, load all your "p=v&p2=v2" parameters into postParams.  (like a query string)
		req.send(this.postParams);
		
		//display a friendly alert, for lack of a better solution
		if (this.error) alert("Error Completing Transaction");
	};
	
	// caching variant, attempts to retrieve value from cache, otherwise retrieves it from server.
	this.cacheRequest = function(url, selObject) {
		// first check cache for requested key
		var cacheKey = getCacheKeyFromUrl(url);
		selObject.responseText =  retrFromCache(cacheKey);
		if (selObject.responseText != null && selObject.responseText != '') {
			// in cache, use it.
			selObject.callBack(selObject);
		} else {
			// not in cache, retrieve it from server.
			var proxyObj = new Object();
			proxyObj.responseText = null;
			proxyObj.callBack = function(vObj) {
				// cache the value
				putInCache(cacheKey, vObj.responseText);
				// set value on original selObject 
				selObject.responseText = vObj.responseText;
				// process original selObject's callBack
				selObject.callBack(selObject);
			}
			// retrieve value
			this.sendRequest(url,null,SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, proxyObj);
		}
	};
}
/*****************  END SMT JAVASCRIPT HTTP OBJECT  ***************************/

/**********  SMT FORM BUILDER/HELPER OBJECT .. NOT A VALIDATOR  ***************/
function SMTFormUtil() {
	this.setSelectOptions = function(selObject) {
		box = selObject.selectField;
		if (box == null) return;
		box.options.length = 0; //flush any existing values
	
		if (selObject.responseText == '') {
			box.options[0] = new Option(selObject.defaultOptionText,"");
		} else {
			idx = 0;
			if (selObject.firstOption != undefined) {
				//populate the 1st option if we were asked to
				//firstOption is-a Option (Object)
				box.options[idx] = selObject.firstOption;
				++idx;
			}
			
			//iterate the Collection and populate the field's options list
			optionList = eval('(' + selObject.responseText + ')');
			for (optionKey in optionList) {
				if (optionKey == 'isSuccess' || optionKey == 'jsonActionError') continue;
				//TODO replace "unescape" with "decodeURIComponent" when DB is converted to true UTF-8
				var value = (selObject.useKey) ? optionKey : optionList[optionKey];
				box.options[idx] = new Option(unescape(value), optionKey);
				box.options[idx].selected = (optionKey == selObject.selectedOption);
				++idx;
			}
		}
	};
	
	//sets the desired dropdown item as "selected".  this is the proper/DOM way to do it! 
	this.setSelectedIndex = function(field, val) {
	    for (var i=0; i < field.options.length; i++ ) {
	        if (field.options[i].value == val) {
	            field.options[i].selected = true;
	            return;
	        }
	    }
	};
};
/*****************  END SMT FORM BUILDER/HELPER OBJECT  ***********************/

function getInternetExplorerVersion(){
	//Returns the version of Windows Internet Explorer or a -1
	//(indicating the use of another browser).
	var rv = -1; // Return value assumes failure.
	if (navigator.appName == 'Microsoft Internet Explorer')
	{
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
	}
	return rv;
}

/**
 * shortcut sharing a page/URL on Facebook
 * @param pageUrl
 */
function shareFacebook(pageUrl) {
	if (pageUrl == null || pageUrl == "") pageUrl = window.location;
	else if (pageUrl.charAt(0) == "/") pageUrl = window.location.origin + pageUrl;
	pageUrl ="//www.facebook.com/sharer/sharer.php?display=popup&u=" + encodeURIComponent(pageUrl);
	leaveSite(pageUrl, null);
}

/**
 * shortcut sharing a page/URL on Twritter
 * @param pageUrl
 */
function shareTwitter(pageUrl) {
	if (pageUrl == null || pageUrl == "") pageUrl = window.location;
	else if (pageUrl.charAt(0) == "/") pageUrl = window.location.origin + pageUrl;
	var url="//twitter.com/share?";
	url+="original_referer="+encodeURIComponent(pageUrl);
	url+="&text="+encodeURIComponent(document.title);
	leaveSite(url, null);
}

/**
 * opens a reused modal window with the EAF form
 * @param pageUrl
 */
function shareEmail(pageUrl) {
	if (pageUrl.charAt(0) == "/") pageUrl = location.origin + pageUrl;
	
	$('#register1').modal({
		remote: "/json?amid=email&view=true&emailFriendUrl=" + pageUrl
	}).on('hidden.bs.modal', function (e) {
		//flush it out so we can reuse it
		$(this).removeData('bs.modal');
	});
}
	

/**
 * Takes in a type of request and a url that we want to know about and returns the number
 *  of that type of hits that page has had.<br/>
 *  5/Default: Total Count<br/>
 *  4: Like Count<br/>
 *  3: Comment Count<br/>
 *  2: Share Count<br/>
 *  1: Click Count
 */
function getFacebookStats(type, url, container) {    
	if(getInternetExplorerVersion() > 9.0 || navigator.appName != "Microsoft Internet Explorer") {
		//if url is null default to the window location
	    if(url == null) {
	       url = window.location.href;
	       var index = url.indexOf('#');
	       if (index > -1) {
	    	   url = url.substring(0, index);
	       }
	    }
	    
	    container.type = type;
	    //build the request, send it out, and return the response.
		var fbStatsUrl = "//api.facebook.com/method/fql.query?format=json&query=select%20total_count,like_count,comment_count,share_count,click_count%20from%20link_stat%20where%20url=%27" + url + "%27";
		new SMTHttpRequest().sendRequest(fbStatsUrl, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, container);
		if(navigator.appName == "Microsoft Internet Explorer")
			fbStatsUrl+="&cacheBuster="+new Date().getTime();
		
	} else if( getInternetExplorerVersion() != 8.0) {
		xdr = new XDomainRequest(); 
		xdr.onload=function() {
			container.responseText = xdr.responseText;
		    container.callBack(container);
		};
		url = "//api.facebook.com/method/fql.query?format=json&query=select%20total_count,like_count,comment_count,share_count,click_count%20from%20link_stat%20where%20url=%27" + url + "%27&cacheBuster="+new Date().getTime();
		xdr.open("GET", url);
		xdr.timeout = 5000;
		xdr.send(); 
		
	} else {
		return 0;	
	}
}



function getTwitterStats(url) {
	// TODO Continue looking for a publicly accesable method for counting tweets about a url
	// For now we just return 0
	return 0;
}

/**
 *  Returns the number of pageviews for the supplied url
 * @param url
 * @returns Number of pageviews for Uri
 */
function getViews(uri, container) {
    var pageViewUrl = "/json?amid=stats&view=1&uri=" + uri+"&cacheBuster="+new Date().getTime();
    new SMTHttpRequest().sendRequest(pageViewUrl, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, container);
}

/*********************** FAVORITES API CALLS ***************************/
/**
 *  Returns the number of pageviews for the supplied url
 * @param url
 * @returns Number of pageviews for Uri
 */
/*
 * Attempt to load list of favorites and put in cache.  If they already
 * exist in cache then just perform callback function.
 */
function loadFavorites(obj) {
	if (obj == null) obj = new Object();
	obj.callBack = loadFavoritesCallback;
	obj.putInCache = false;
	obj.responseText = retrFromCache("FAVORITES_CACHE");
	if (obj.responseText == null) {
		obj.putInCache = true;
		obj.favoritesUrl = "/json?amid=favorites&view=true";
	    new SMTHttpRequest().sendRequest(obj.favoritesUrl, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, obj);
	} else {
		loadFavoritesCallback(obj); //used the cached object
	}
}
/*
 * Do something with the results once we have them in Session cache.
 */
function loadFavoritesCallback(obj) {
	if (obj.putInCache && obj.responseText != null)
		putInCache("FAVORITES_CACHE", obj.responseText);
	try {
		var cnt = 0;
		var resData = JSON.parse(obj.responseText);
		cnt = resData.length;
		$(".flag").each(function(i) { //loop and find the DOM elements that need stats
			if (smtArrayContains(resData, $(this).attr("smt-uri")))
				$(this).removeClass("opaque");
		});
		obj.favCnt = cnt;
	} catch (err) {}
	if (obj.returnFunc != null) obj.returnFunc(obj); //callback to whomever invoked us
}
/*
 * Add or remove a Favorite link depending on isInsert.  Element
 * is the item with all the attributes on it.
 */
function editFavorite(ele, isInsert, obj) {
	if (obj == null) obj = new Object();
	obj.isInsert = isInsert;
	obj.uriTxt = $(ele).attr("smt-uri");
	if (isInsert) {
		obj.typeCd = $(ele).attr("smt-asset-type");
		obj.relId = $(ele).attr("smt-asset-id");
		obj.callBack = editFavoriteCallback;
		obj.favoritesUrl = "/json?amid=favorites&requestType=reqBuild&view=true&uriTxt=" + encodeURIComponent(obj.uriTxt) + "&typeCd=" + obj.typeCd + "&relId=" + obj.relId;
		new SMTHttpRequest().sendRequest(obj.favoritesUrl, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, obj);
	} else {
		obj.callBack = editFavoriteCallback;
		obj.favoritesUrl = "/json?amid=favorites&requestType=reqBuild&isDelete=true&uriTxt=" + encodeURIComponent(obj.uriTxt);
		new SMTHttpRequest().sendRequest(obj.favoritesUrl, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, obj);
	}
}
/*
 * Callback for adding a new Favorite Link
 */
function editFavoriteCallback(obj) {
	//Get Favs and ensure we have object type.
	var favs = JSON.parse(retrFromCache("FAVORITES_CACHE"));
	if (favs == null) favs = [];
	
	if (obj.isInsert) {
		//add to cached array
		favs.push(obj.uriTxt);
	} else {
		//remove from cached array
		var idx = smtArrayIndexOf(favs, obj.uriTxt);
		if (idx < 0) return; //this item is not in the cached object to remove 
		favs.splice(idx, 1);
	}
	obj.favCnt = favs.length;

	//store updated object in cache.
	putInCache("FAVORITES_CACHE", JSON.stringify(favs));
	if (obj.returnFunc != null) obj.returnFunc(obj); //callback to whomever invoked us
}
/*********************** END OF FAVORITES API CALLS ***************************/
/**
 * used by toggle_question.jsp FAQ View.
 * @requires jquery support on the page
 * @param faqId
 */
function toggleFAQResponse(faqId) {
	$("#faqResponse_"+faqId).toggle();
	$("#faqBullet_"+faqId).toggleClass("open");
}


/**
 * used by forums and contact-us to reload the captcha image
 * @param eleId
 */
function reloadCaptchaImage(eleId) {
	document.getElementById(eleId).src = "/captcha?" + Math.random();
}


/**
 * loads the given video path into a Shadowbox to be played.  This method leverages
 * the SMT video library core and caching mechanisms for JS loading.
 * by JM 06.09.2014
 * @param jsonPath
 * @param title
 * @param width
 * @param height
 * @param aspect
 * @param type
 */
function playVideoInShadowbox(jsonPath, title, width, height, aspect, type) {
	if (width == null) width = 689;
	if (height == null) height = 387;
	if (aspect == null) aspect = "16:9";
	if (type == null) type = "video/mp4";
	
	Shadowbox.open({
		content:  '<div class="videoContainer" style="width:' + width + 'px;height:' + height + 'px;"><div class="videoPlayer" id="shadowboxPlayVideo"></div></div>',
		options: { onFinish: 	startShadowboxVideo, onClose: stopShadowboxVideo, modal: true  },
		player:    "html",
		title:      	title,
		height:		height,
		width:     width,
		smtPath: jsonPath,
		smtAspect: aspect,
		smtType: type
	});
}
/* stops a video playing in Shadowbox, when the user closes the modal */
function stopShadowboxVideo() {
	try { jwplayer().stop(); } catch (err) {}
}
/* starts a video in Shadowbox as the modal opens */
function startShadowboxVideo(obj) {
	loadSMTVideoPlayer({
		div: "shadowboxPlayVideo", 
		src: obj.smtPath, 
		width: obj.width, 
		height: obj.height, 
		aspectratio: obj.smtAspect, 
		autoPlay: "true", 
		type: obj.smtType
	});
}


/******************************************************************************
 * The methods below this line are all reusable caching mechanisms/APIs.
 ******************************************************************************/
/**
 * test the browser to see if it supports localStorage
 * @returns boolean
 */
function supports_html5_storage() {
	//test for cache bypass
	if ('undefined' === typeof cacheByPass) {
		//console.log("testing for cookie");
		cacheByPass = (readCookie("pagePreview") == "true");
	}
	//console.log("bp=" + cacheByPass);
	//when in preview mode, do not read or write to cache
	if (cacheByPass)
		return false;
	
	try {
		return 'sessionStorage' in window && window['sessionStorage'] !== null;
	} catch (e) {
		return false;
	}
}

/**
 * retrieves an item from the localStorage using the given key
 * @param cacheKey
 * @returns object or null
 */
function retrFromCache(cacheKey) {
	//console.log("loading from cache: " + cacheKey);
	if (supports_html5_storage()) {
		try {
			return JSON.parse(sessionStorage.getItem(cacheKey));
		} catch (e) {
			//console.log(e);
		}
	}
	return null;
}

/**
 * put an item/object into localStorage
 * @param cacheKey
 * @param obj
 */
function putInCache(cacheKey, str) {
	//console.log("storing in cache: " + cacheKey);
	if (supports_html5_storage()) {
		try {
			sessionStorage.setItem(cacheKey, JSON.stringify(str));
		} catch (e) {
			//console.log(e);
		}
	}
}

/**
 * remove an item from localStorage
 * @param cacheKey
 */
function removeFromCache(cacheKey) {
	if (supports_html5_storage()) {
		try {
			sessionStorage.removeItem(cacheKey);
		} catch(e) {
			//console.log(e);
		}
	}
}
/**
 * remove all items from localStorage
 */
function flushCache() {
	if (supports_html5_storage()) {
		try {
			sessionStorage.clear();
		} catch(e) {
			//console.log(e);
		}
	}
}
/**
 * strips characters that cause caching issues based upon a URL; which is typically 
 * a safe UUID to define an asset loaded via http
 * @param url to be scrubbed and returned
 */
function getCacheKeyFromUrl(url) {
	url = url.replace(/\?/g, "");
	url = url.replace(/&/g, "");
	url = url.replace(/=/g, "");
	url = url.replace(/#/g, ""); //a hash the browser would see even though it's not sent to the server
	url = url.replace(/\//g, "");
	//console.log("built cacheKey " + url);
	return url;
}
/*************** END CACHING APIs ********************************************/

/*****************************************************************************
*   Methods for client side goecoding. Needs the form, a message to display  *
*   if form evaluation fails (or a blank message to skip evaluation), and    *
*   a lat and long name if using the default geocoding callback.             *
******************************************************************************/

/**
 * checks the form for standard address fields to create a complete address 
 * and submits it for geocoding.
 */
function submitGeocodedLocationSearch(form, msg, latName, longName) {
	geocodeAddress(parseAddress(form), form, msg, assignGeocodedLatLong, latName, longName );
}

/**
 * Check the form for standard address fields and returns the complete address
 * @param form
 * @returns {String}
 */
function parseAddress(form) {
	address="";
	if (form.fullAddress) {
		address += form.fullAddress.value;
	} else {
		if (form.address) address += form.address.value;
		if (form.city) address += "," + form.city.value;
		if (form.state && form.state.value) address += "," + form.state.value;
		if (form.zip) address += form.zip.value;
		if (form.zipCode) address += form.zipCode.value;
		if (form.country && form.country.value) address += "," + form.country.value;
	}
	return address;
}

/**
 * Makes a string from an object with mapped google map components.
 * @param components
 * @returns {String}
 */
function parseAddressComponents(components){
	var comp = '&components=';
	var compTypes = ["route","locality","administrative_area","postal_code","country"];
	var added = false;
	
	for(var i=0; i<compTypes.length; i++){
		if (components[compTypes[i]]){
			if (added)
				comp += "|";
			comp += compTypes[i] + ":"+ components[compTypes[i]];
			added = true;
		}
	}
	
	return comp;
}

/**
 * submit the location to google for client site geocoding so as to lessen the
 * calls sent from out servers. latName and longName are not required if we are
 * not using the default callback utilized by submitGeocodedLocationSearch.
 */
function geocodeAddress(address, theForm, msg, callBack, latName, longName) {
	if (msg == "" || checkVals(theForm, msg)) {
		url="//maps.googleapis.com/maps/api/geocode/json?sensor=false&address=";
		url += address;
		obj = new Object();
		obj.callBack = callBack;
		obj.form = theForm;
		obj.lat = latName;
		obj.long = longName;
		new SMTHttpRequest().sendRequest(url, null, SMTHttpRequest.Types.OBJ_CALLBACK_OBJ, obj);
	} else {
		return false;
	}
}

/**
 * Assign proper values to the lat and long variables if we got them back from google.
 * @param obj
 */
function assignGeocodedLatLong(obj) { 
	var json = eval("(" + obj.responseText + ")");
	if (json.results[0]) {
		obj.form[obj.lat].value = json.results[0].geometry.location.lat;
		obj.form[obj.long].value = json.results[0].geometry.location.lng;
	}
	obj.form.submit();
}
/********************* END OF GEOCODING METHODS *****************************/

/** 
 * Password validation 
 * Validates password complexity using the input string, the min/max length, the complexity
 * level, and the complexity regex pattern 
 **/
function validateComplexity(pswd, cPlex) {
	if (cPlex == null) return true;
	//let dummy passwords go through; the system will ignore these
	if (pswd == "**********") return true;
	if (!RegExp(cPlex.regex).test(pswd) || ((pswd.length < cPlex.min) || (pswd.length > cPlex.max))) {
		var cTxt = cPlex.errMsg;
		cTxt = cTxt.replace('#MIN#', cPlex.min);
		cTxt = cTxt.replace('#MAX#', cPlex.max);
		cTxt = cTxt.replace('#PWD#', pswd);
		cTxt = cTxt.replace('#CHARS#', cPlex.levelMsg);
		smtAlert(cTxt);	
		return false;
	} else {
		return true;
	}
}

/**
 * Checks if we are dealing with a version of IE that does not support the 
 * placeholder attributes and, if so, creates psuedo placeholders for the form
 */
function applyPlaceholders() {
	 /**
	  * needed by IE 8 to support placeholder attributes on input fields.
	  */
	if (getInternetExplorerVersion() < 8 || getInternetExplorerVersion() > 9) return;
	
	$('[placeholder]').parents('form').submit(function() {
		$(this).find('[placeholder]').each(function() {
			var input = $(this);
			if (input.val() == input.attr('placeholder')) {
				input.val('');
			}
		});
	});
	$('[placeholder]').focus(function() {
		var input = $(this);
		if (input.val() == input.attr('placeholder')) {
			input.val('');
			input.removeClass('placeholder');
		}
	}).blur(function() {
		var input = $(this);
		if (input.val() == '' || input.val() == input.attr('placeholder')) {
			input.addClass('placeholder');
			input.val(input.attr('placeholder'));
		}
	}).blur();
}

/**
 * Used for passing event-based analytic data to Google. Sets default required
 * values. Executes the obj.hitCallback function (if exists) regardless of a successfull
 * analytic update.
 * Required fields: hitType, eventAction, and eventCategory
 * @param obj JS object with the named parameters to pass to Google
 */
function gaTrackEvent(type, category, action, label, callback, value ){
	var obj = {};
	obj.hitType = (type == null ? 'event':type);
	obj.eventCategory = (category == null ? 'category':category);
	obj.eventAction = (action == null ? 'click':action);
	obj.eventLabel = (label == null ? 'label':label);
	obj.eventValue = (value == null ? 1:value);
	if (callback != null) obj.hitCallback = callback;
	
	try {
		ga('send', obj);
	}
	catch(err) {
		//attempt the callback if the analytic fails
		if (callback != null && typeof callback === "function")
			callback();
	}
}

function bookmarkPage() {
	var bookmarkURL = window.location.href;
    var bookmarkTitle = document.title;

    if ('addToHomescreen' in window && window.addToHomescreen.isCompatible) {
      // Mobile browsers
      addToHomescreen({ autostart: false, startDelay: 0 }).show(true);
    } else if (window.sidebar && window.sidebar.addPanel) {
      // Firefox version < 23
      window.sidebar.addPanel(bookmarkTitle, bookmarkURL, '');
    } else if ((window.sidebar && /Firefox/i.test(navigator.userAgent)) || (window.opera && window.print)) {
      // Firefox version >= 23 and Opera Hotlist
      $(this).attr({
        href: bookmarkURL,
        title: bookmarkTitle,
        rel: 'sidebar'
      }).off(e);
      return true;
    } else if (window.external && ('AddFavorite' in window.external)) {
      // IE Favorite
      window.external.AddFavorite(bookmarkURL, bookmarkTitle);
    } else {
      // Other browsers (mainly WebKit - Chrome/Safari)
      alert('Press ' + (/Mac/i.test(navigator.userAgent) ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
    }

    return false;
}
