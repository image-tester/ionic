
/**
 * @private
 */
IonicModule
.factory('$$ionicAttachDrag', [function() {

  return attachDrag;

  function attachDrag(scope, element, options) {
    var opts = extend({}, {
      getDistance: function() { return opts.element.prop('offsetWidth'); },
      onDragStart: angular.noop,
      onDrag: angular.noop,
      onDragEnd: angular.noop,
    }, options);

    var dragStartGesture = ionic.onGesture('dragstart', handleDragStart, element[0]);
    var dragGesture = ionic.onGesture('drag', handleDrag, element[0]);
    var dragEndGesture = ionic.onGesture('dragend', handleDragEnd, element[0]);

    scope.$on('$destroy', function() {
      ionic.offGesture(dragStartGesture, 'dragstart', handleDragStart);
      ionic.offGesture(dragGesture, 'drag', handleDrag);
      ionic.offGesture(dragEndGesture, 'dragend', handleDragEnd);
    });

    element.on('touchmove pointermove mousemove', function(ev) {
      if (dragState && dragState.dragging) ev.preventDefault();
    });

    var dragState;
    function handleDragStart(ev) {
      if (dragState) return;
      dragState = {
        startX: ev.gesture.center.pageX,
        startY: ev.gesture.center.pageY,
        distance: opts.getDistance()
      };
      opts.onDragStart();
    }
    function handleDrag(ev) {
      if (!dragState) return;
      var deltaX = dragState.startX - ev.gesture.center.pageX;
      var deltaY = dragState.startY - ev.gesture.center.pageY;
      var isVertical = ev.gesture.direction === 'up' || ev.gesture.direction === 'down';

      if (isVertical && Math.abs(deltaY) > Math.abs(deltaX) * 2) {
        handleDragEnd(ev);
        return;
      }
      dragState.dragging = true;

      var percent = getDragPercent(ev.gesture.center.pageX);
      opts.onDrag(percent);
    }
    function handleDragEnd(ev) {
      if (!dragState) return;
      var percent = getDragPercent(ev.gesture.center.pageX);
      options.onDragEnd(percent, ev.gesture.velocityX);

      dragState = null;
    }

    function getDragPercent(x) {
      var delta = dragState.startX - x;
      var percent = delta / dragState.distance;
      return percent;
    }
  }

}]);
