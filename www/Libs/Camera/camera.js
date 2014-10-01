//requirements: jquery modal

//COSTANTS
function openCameraDialog(){
	/*$('body').append(
		<div id="cameraAccessDialog" class="camera-access-dialog" title="Select Destination:">
			<div class="button-container">
				<div id="cameraBtn" class="camera-dialog-btn" onclick="openCamera('camera')">Camera</div>
				<div id="cameraBtn" class="camera-dialog-btn" onclick="openCamera('gallery')">Gallery</div>
				<!--<div id="cameraBtn" class="camera-dialog-btn" onclick="openCamera('album')">PhotoGallery</div>-->
				<div id="cameraBtn" class="camera-dialog-btn" onclick="closeDialog()">Close</div>
			</div>
		</div>
	);*/

	$( "#cameraAccessDialog" ).dialog({
		dialogClass: "camera-Dialog",
 		resizable: false,
 		width: 200,
 		modal: true,
 		open: function(){
 			//Get The Height Of Window
			var height = $(window).height();
			//Change Overlay Height
			$('.ui-widget-overlay').css('height', height);
 		}
 	});
}

function openCamera(source, options){
	//selects source type, defaults = camera if none
	if (!options){
		var currentOptions = {
			quality : 100,
		  	destinationType : Camera.DestinationType.DATA_URL,
		  	sourceType : Camera.PictureSourceType.CAMERA,
		  	allowEdit : true,
		  	encodingType: Camera.EncodingType.JPEG,
		  	saveToPhotoAlbum: true
		};	
	} else {
		currentOptions = options;
	}

	switch (source) {
		case 'camera':
			currentOptions.sourceType = Camera.PictureSourceType.CAMERA;
			break;
		case 'gallery':
			currentOptions.sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
			break;
		case 'album':
			currentOptions,sourceType = Camera.PictureSourceTypeSAVEDPHOTOALBUM;
			break;
		default:
			currentOptions.sourceType = Camera.PictureSourceType.CAMERA;
			break;
	}

	navigator.camera.getPicture(onSuccess, onError, currentOptions);
}
function closeDialog(){
	$( "#cameraAccessDialog" ).dialog('destroy');
}

function onSuccess(imageData){
	var image = "data:image/jpeg;base64," + imageData;
	$('.dialog-form-input-images').append("<div class='dialog-form-input-image'> <img src="+ image + "></div>");
	closeDialog();
	return image;
}
function onError(errorMessage){
	console.log(errorMessage);
}