document.addEventListener('mousedown', getXpathStart);
document.addEventListener('mousedown', removeHighlightSelection);
document.addEventListener('mousedown', removeHighlight);
document.addEventListener('mouseup', getXpathEnd);

function generateid() {
   let id;
   id = (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");

   XsltForms_xmlevents.dispatch(
       document.getElementById("index"),
       "callbackevent", null, null, null, null,
       {
          itemId: id
       });
}

function getXpathStart (event) {
   if (event === undefined) event = window.event;

   var target = 'target' in event ? event.target: event.srcElement;
   var path = getXPath(target);


   if(target.closest("#edition")) {
      console.log("start xpath: ", path)
      XsltForms_xmlevents.dispatch(document.getElementById("index"), "getStartXpath", null, null, null, null, {
         xpathStart: path
      });
   }
   else {console.log("Texte hors périmètre (début) ! ")}
}

function getXpathEnd (event) {
   if (event === undefined) event = window.event;
   var target = 'target' in event ? event.target: event.srcElement;
   var path = getXPath(target);

   const selection = () => {
      if (window.getSelection)
         return window.getSelection();
   }

   if(target.closest("#edition")) {
      console.log(
          'event: ',  event,
          'target: ',  target,
          'startOffset: ',  selection().anchorOffset,
          'endOffset: ', selection().focusOffset.toString(),
          'text: ', selection().toString(),
          'length: ', selection().toString().length
      )
      highlightSelection()
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

function highlightSelection() {
   var userSelection = window.getSelection().getRangeAt(0);
   var safeRanges = getSafeRanges(userSelection);
   for (var i = 0; i < safeRanges.length; i++) {
      highlightRange(safeRanges[i]);
   }
}

function highlightRange(range) {
   var newNode = document.createElement("span");
   newNode.setAttribute(
       "class",
       "highlight"
   );
   range.surroundContents(newNode);
}

function getSafeRanges(dangerous) {
   var a = dangerous.commonAncestorContainer;
   // Starts -- Work inward from the start, selecting the largest safe range
   var s = new Array(0), rs = new Array(0);
   if (dangerous.startContainer != a) {
      for (var i = dangerous.startContainer; i != a; i = i.parentNode) {
         s.push(i);
      }
   }
   if (s.length > 0) {
      for (var i = 0; i < s.length; i++) {
         var xs = document.createRange();
         if (i) {
            xs.setStartAfter(s[i - 1]);
            xs.setEndAfter(s[i].lastChild);
         } else {
            xs.setStart(s[i], dangerous.startOffset);
            xs.setEndAfter((s[i].nodeType == Node.TEXT_NODE) ? s[i] : s[i].lastChild);
         }
         rs.push(xs);
      }
   }

   // Ends -- basically the same code reversed
   var e = new Array(0), re = new Array(0);
   if (dangerous.endContainer != a) {
      for (var i = dangerous.endContainer; i != a; i = i.parentNode) {
         e.push(i);
      }
   }
   if (e.length > 0) {
      for (var i = 0; i < e.length; i++) {
         var xe = document.createRange();
         if (i) {
            xe.setStartBefore(e[i].firstChild);
            xe.setEndBefore(e[i - 1]);
         } else {
            xe.setStartBefore((e[i].nodeType == Node.TEXT_NODE) ? e[i] : e[i].firstChild);
            xe.setEnd(e[i], dangerous.endOffset);
         }
         re.unshift(xe);
      }
   }

   // Middle -- the uncaptured middle
   if ((s.length > 0) && (e.length > 0)) {
      var xm = document.createRange();
      xm.setStartAfter(s[s.length - 1]);
      xm.setEndBefore(e[e.length - 1]);
   } else {
      return [dangerous];
   }

   // Concat
   rs.push(xm);
   response = rs.concat(re);

   // Send to Console
   return response;
}

// this fonction removes span.highlight added with highlightSelection()
function removeHighlightSelection(event) {
   var target = 'target' in event ? event.target: event.srcElement;
   if(target.closest("#edition")) {
      var select = document.getElementsByClassName('highlight');
      while(select.length) {
         var parent = select[ 0 ].parentNode;
         while( select[ 0 ].firstChild ) {
            parent.insertBefore(  select[ 0 ].firstChild, select[ 0 ] );
         }
         parent.removeChild( select[ 0 ] );
      }
   }
}

function showHighlight(xpath) {
   var element = document.evaluate(xpath, document, null,
       XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

   // Check if the element was found and do something with it
   if (element !== null) {
      // Do something with the element
      console.log(element);
      element.scrollIntoView();
      element.classList.add("showHighlight");
   }
}

function removeHighlight() {
   var target = 'target' in event ? event.target: event.srcElement;
   if(target.closest("#edition")) {
      const elements = document.querySelectorAll('*');
      elements.forEach((element) => {
         element.classList.remove("showHighlight")
      });
   }
}