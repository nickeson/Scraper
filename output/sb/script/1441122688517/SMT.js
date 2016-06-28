
function hideElement(element){document.getElementById(element).style.display="none";}
function checkWindowLocation(urlPath){var windowPath=window.location.pathname;if(urlPath==windowPath){return true;}
return false;}
function hidePageElement(urlPath){var windowTrue=checkWindowLocation(urlPath);if(windowTrue){hideElement("benefit-3");}}
document.addEventListener('DOMContentLoaded',function(){hidePageElement("/");hidePageElement("/terms-and-conditions");hidePageElement("/privacy-policy");$("span.required").html(" ");$("ul.dropdown-menu").hover(function(){$(this).siblings().css("background","hsl(0, 0%, 40%)")},function(){$(this).siblings().css("background","transparent")});$("#mobile_nav_trigger_wrap").click(function(event){$('html,body').scrollTop(0);});});
