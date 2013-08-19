var notifications = Windows.UI.Notifications;

var template = notifications.TileTemplateType.tileWideImageAndText01;
var tileXml = notifications.TileUpdateManager.getTemplateContent(template);

var tileTextAttributes = tileXml.getElementsByTagName("text");
tileTextAttributes[0].appendChild(tileXml.createTextNode("2 Fishes & 5 loaves of bread"));
//tileTextAttributes[1].appendChild(tileXml.createTextNode("2 Fish & 5 loaves of bread"));

var tileImageAttributes = tileXml.getElementsByTagName("image");
tileImageAttributes[0].setAttribute("src", "ms-appx:///images/widelogo.png");
//tileImageAttributes[0].setAttribute("src", "ms-appx:///local/wide_logo.png");
tileImageAttributes[0].setAttribute("alt", "2 Fishes & 5 Loaves of Bread");

//tileImageAttributes[1].setAttribute("src", "ms-appx:///images/logo.png");
//tileImageAttributes[0].setAttribute("src", "ms-appx:///local/wide_logo.png");
//tileImageAttributes[1].setAttribute("alt", "2 Fish to catch");



var squareTemplate = notifications.TileTemplateType.tileSquareText04;
var squareTileXml = notifications.TileUpdateManager.getTemplateContent(squareTemplate);
var squareTileTextAttributes = squareTileXml.getElementsByTagName("text");
squareTileTextAttributes[0].appendChild(squareTileXml.createTextNode("Food for souls"));

var node = tileXml.importNode(squareTileXml.getElementsByTagName("binding").item(0), true);
tileXml.getElementsByTagName("visual").item(0).appendChild(node);

var tileNotification = new notifications.TileNotification(tileXml);

var currentTime = new Date();
tileNotification.expirationTime = new Date(currentTime.getTime() + 600 * 1000);

notifications.TileUpdateManager.createTileUpdaterForApplication().update(tileNotification);

