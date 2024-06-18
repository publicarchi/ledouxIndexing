document.addEventListener('mouseup', getSelectionInfo);
document.addEventListener('mousedown', removeHighlightSelection);

/*
* This function add "selected" class to xforms tabs
*/
document.addEventListener('click', function handleClick(event) {
  var target = event.target;
  var newActiveTab = target.closest('xforms-trigger.tab');

  if(target.closest('xforms-trigger.tab')) {   
     const prevActiveTab = document.querySelectorAll('*');
     prevActiveTab.forEach((element) => { element.classList.remove("selected") });

     newActiveTab.classList.add('selected')
  }
});

/*
* This function generate id for index entries
*/
function generateid() {
  let id;
  id = (performance.now().toString(36)+Math.random().toString(36)).replace(/\./g,"");

  XsltForms_xmlevents.dispatch(
      document.getElementById("index"),
      "callbackevent", null, null, null, null,
      {
         itemId: id
      }
  );
}


/*
this function returns xpointer for the selected text
*/
function getSelectionInfo() {
  const selection = window.getSelection();
  var target = 'target' in event ? event.target: event.srcElement;
  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);
  const startNode = range.startContainer;
  const endNode = range.endContainer;

  const selected = () => {
    if (window.getSelection)
       return window.getSelection();
  }

  // Get XPath
  function getXPath(node) {
      if (node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
      }
      const parts = [];
      while (node && node.nodeType === Node.ELEMENT_NODE) {
          let count = 0;
          let sibling;
          for (sibling = node.previousSibling; sibling; sibling = sibling.previousSibling) {
              if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
                  count++;
              }
          }
          const part = node.nodeName.toLowerCase() + (count > 0 ? '[' + (count + 1) + ']' : '');
          parts.unshift(part);
          node = node.parentNode;
      }
      return parts.length ? '/' + parts.join('/') : null;
  }

  // Get the XPath of the start and end nodes
  const startXPath = getXPath(startNode);
  const endXPath = getXPath(endNode);

  // Calculate index and length
  //const startIndex = range.startOffset;
  const startIndex = selected().anchorOffset.toString();
  const endIndex = range.endOffset;
  const textLength = range.toString().length;
  const textSelection = selected().toString();

  /*return {
      startXPath: startXPath,
      endXPath: endXPath,
      startIndex: startIndex,
      endIndex: endIndex,
      length: textLength
  };*/
  if(target.closest("#edition")) {
    XsltForms_xmlevents.dispatch(document.getElementById("index"), "getSelectionInfo", null, null, null, null, {
      startXPath: startXPath.concat('/text()'),
      endXPath: endXPath,
      startIndex: startIndex,
      endIndex: endIndex,
      length: textLength,
      textSelection: textSelection
    })
  } else {console.log("Texte hors périmètre ! ")};
};

/*
  this function highlights indexed text
*/
function highlightText(startXPath, startIndex, highlightLength) {

  function getNodeByXPath(xpath) {
    const evaluator = new XPathEvaluator();
    const result = evaluator.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    return result.singleNodeValue;
  }

  const startNode = getNodeByXPath(startXPath);
  if (!startNode || startNode.nodeType !== Node.TEXT_NODE) {
    console.error('Invalid XPath or the node is not a text node.');
    return;
  }

  let remainingLength = highlightLength;
  let nodesToHighlight = [];
  let foundStart = false;

  function traverse(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      let textContent = node.textContent;
      if (!foundStart) {
        if (node === startNode) {
          foundStart = true;
          let textToEnd = textContent.slice(startIndex);
          nodesToHighlight.push({ node, start: startIndex, length: Math.min(remainingLength, textToEnd.length) });
          remainingLength -= textToEnd.length;
        }
      } else if (remainingLength > 0) {
        nodesToHighlight.push({ node, start: 0, length: Math.min(remainingLength, textContent.length) });
        remainingLength -= textContent.length;
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (remainingLength <= 0) return;
        traverse(node.childNodes[i]);
      }
    }
  }

  // Start traversal from the root container
  traverse(document.body);

  // Apply the highlighting
  nodesToHighlight.forEach(({ node, start, length }) => {
    const highlightedText = node.textContent.slice(0, start) +
                            `<span class="highlight">${node.textContent.slice(start, start + length)}</span>` +
                            node.textContent.slice(start + length);
    const span = document.createElement('span');
    span.innerHTML = highlightedText;
    node.replaceWith(...span.childNodes);
  });

  // to focus on the element
  var startElement = startXPath.replace('/text()', '')
  var element = document.evaluate(startElement, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    
  if (element !== null) {
    element.scrollIntoView();
  }
}

/*
* This fonction removes highlighting over indexed text
*/
function removeHighlightText(event) {
  var select = document.getElementsByClassName('highlight');
  while(select.length) {
    var parent = select[ 0 ].parentNode;
    while( select[ 0 ].firstChild ) {
      parent.insertBefore(  select[ 0 ].firstChild, select[ 0 ] );
    }
    parent.removeChild( select[ 0 ] );
  }
};

/*
* the following statements keep selected text highlighted
* @issue doesn't keep highlight when focus change…
*/
var saveSelection, restoreSelection;
if (window.getSelection) {
    // IE 9 and non-IE
    saveSelection = function() {
        var sel = window.getSelection(), ranges = [];
        if (sel.rangeCount) {
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                ranges.push(sel.getRangeAt(i));
            }
        }
        return ranges;
    };

    restoreSelection = function(savedSelection) {
        var sel = window.getSelection();
        sel.removeAllRanges();
        for (var i = 0, len = savedSelection.length; i < len; ++i) {
            sel.addRange(savedSelection[i]);
        }
    };
} else if (document.selection && document.selection.createRange) {
    // IE <= 8
    saveSelection = function() {
        var sel = document.selection;
        return (sel.type != "None") ? sel.createRange() : null;
    };

    restoreSelection = function(savedSelection) {
        if (savedSelection) {
            savedSelection.select();
        }
    };
}

window.onload = function() {
    var specialDiv = document.getElementById("side-summary");
    var specialField = document.getElementById("conceptsField");
    var savedSel = null;

    specialDiv.onmousedown = function() {
        savedSel = saveSelection();
    };

    specialDiv.onmouseup = function() {
        restoreSelection(savedSel);
    };

    specialField.onmousedown = function() {
      savedSel = saveSelection();
  };

  specialField.onmouseup = function() {
      restoreSelection(savedSel);
  };
};

/*
* This fonction removes span.highlight added with highlightSelection()
*/
/*
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
*/