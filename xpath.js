document.onmousedown = function (event) {
   if (event === undefined) event = window.event;

   var target = 'target' in event ? event.target: event.srcElement;
   var path = getXPath(target);

   const selection = () => {
      if (window.getSelection)
         return window.getSelection();
   }

   if(target.closest("#edition")) {
      console.log("start xpath: ", path)
      XsltForms_xmlevents.dispatch(document.getElementById("index"), "getStartXpath", null, null, null, null, {
         xpathStart: path
      });
   }
   else {console.log("Texte hors périmètre (début) ! ")}
}

document.onmouseup = function (event) {
   if (event === undefined) event = window.event;
   var target = 'target' in event ? event.target: event.srcElement;
   var path = getXPath(target);

   const selection = () => {
      if (window.getSelection)
         return window.getSelection();
   }

   if(target.closest("#edition")) {
      console.log(
          'startOffset: ',  selection().anchorOffset,
          'endOffset: ', selection().focusOffset.toString(),
          'text: ', selection().toString(),
          'length: ', selection().toString().length
      )
      XsltForms_xmlevents.dispatch(document.getElementById("index"), "getEndXpath", null, null, null, null, {
         xpathEnd: path,
         indexStart: selection().anchorOffset.toString(),
         indexEnd: selection().focusOffset.toString(),
         text: selection().toString(),
         length: selection().toString().length
      });
   }
   else {console.log("Texte hors périmètre (fin) !")}
}

function getXPath(element) {
   if (element.id !== '')
   return "//*[@id='" + element.id + "']";

   if (element === document.body)
   return element.tagName.toLowerCase();

   var ix = 0;
   var siblings = element.parentNode.childNodes;
   for (var i = 0; i < siblings.length; i++) {
      var sibling = siblings[i];

      if (sibling === element) return getXPath(element.parentNode) + '/' + element.tagName.toLowerCase() + '[' + (ix + 1) + ']';

      if (sibling.nodeType === 1 && sibling.tagName === element.tagName) {
         ix++;
      }
   }
}