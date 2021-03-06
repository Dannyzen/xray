require('../spec_helper');
var update = React.addons.update;

describe('DesiredLrp', function() {
  var Cursor, subject, desiredLrp, actualLrps, selectionCallbackSpy, sidebarCallbackSpy;
  beforeEach(function() {
    var DesiredLrp = require('../../../app/components/desired_lrp');

    actualLrps = [
      Factory.build('actualLrp', {process_guid: 'Diego'}),
      Factory.build('actualLrp', {process_guid: 'Diego'}),
      Factory.build('actualLrp', {process_guid: 'Diego', state: 'CLAIMED'})
    ];
    desiredLrp = Factory.build('desiredLrp', {process_guid: 'Diego', instances: 3});
    selectionCallbackSpy = jasmine.createSpy('selection');
    sidebarCallbackSpy = jasmine.createSpy('sidebar');

    Cursor = require('pui-cursor');
    var $selection = new Cursor({hoverDesiredLrp: null, selectedDesiredLrp: null}, selectionCallbackSpy);
    var $sidebar = new Cursor({sidebarCollapsed: false}, sidebarCallbackSpy);
    var colors = ['#fff', '#000'];
    var props = {desiredLrp, actualLrps, containerColor: 'blue', $selection, $sidebar, isSelected: false, sidebarCollapsed: true};
    subject = withContext(
      {colors},
      props,
      function() {
        return (<DesiredLrp {...Object.assign({ref: 'desiredLrp'}, this.props)}/>);
      },
      root
    );
  });

  afterEach(function() {
    React.unmountComponentAtNode(root);
  });

  it('ignores the receptor cursor for rendering', function() {
    expect(subject.refs.desiredLrp.ignorePureRenderProps).toEqual(['$selection']);
  });

  it('renders a container', function() {
    expect('.app-container-sidebar').toExist();
  });

  describe('when hovering over the container', function() {
    beforeEach(function() {
      $('.app-container-sidebar').simulate('mouseOver');
    });

    it('renders a tooltip with the desired lrp information', function() {
      expect('.tooltip').toExist();
      expect('.tooltip').toContainText(desiredLrp.process_guid);
    });

    xdescribe('when no longer hovering over the container', function() {
      //TODO: add this test back, broken with React 13
      beforeEach(function() {
        $('.app-container-sidebar').simulate('mouseOut');
      });

      it('stops rendering a tooltip', function() {
        expect('.tooltip').not.toExist();
      });
    });
  });

  describe('when the sidebar is not collasped', function() {
    beforeEach(function() {
      subject.setProps({sidebarCollapsed: false});
    });

    describe('when hovering over the container', function() {
      beforeEach(function() {
        $('.app-container-sidebar').simulate('mouseOver');
      });

      it('does not render a tooltip', function() {
        expect('.tooltip').not.toExist();
      });
    });
  });

  describe('routes', function() {
    describe('with no routes', function() {
      it('does not throw an exception', function() {
        desiredLrp = update(desiredLrp, {$merge: {routes: null}});
        subject.setProps({desiredLrp});
        expect(() => subject.setProps({desiredLrp})).not.toThrow();
      });
    });

    describe('with more than one route', function() {
      it('renders the routes with ports', function() {
        desiredLrp.routes['cf-router'].forEach(function({port, hostnames}, i) {
          expect(`.desired-lrp tr:eq(${i}) td:eq(0)`).toContainText(port);
          expect(`.desired-lrp tr:eq(${i}) td:eq(1) a`).toContainText(hostnames[0]);
          expect(`.desired-lrp tr:eq(${i}) td:eq(1) a`).toHaveAttr('href', `//${hostnames[0]}`);
          expect(`.desired-lrp tr:eq(${i}) td:eq(1) a`).toHaveAttr('target', '_blank');
        });
      });
    });

    describe('with one route', function() {
      var route;
      beforeEach(function() {
        route = Factory.build('route');
        desiredLrp = update(desiredLrp, {'routes': {'cf-router': {$set: [route]} }});
        subject.setProps({desiredLrp});
      });

      it('renders the route without the port', function() {
        expect('.desired-lrp').toContainText(route.hostnames[0]);
        expect('.desired-lrp').not.toContainText(route.port);
      });
    });

    describe('with a route with multiple host names', function() {
      var route;
      beforeEach(function() {
        route = Factory.build('route', {hostnames: ['foo.com', 'bar.com']});
        desiredLrp = update(desiredLrp, {'routes': {'cf-router': {$set: [route]} }});
        subject.setProps({desiredLrp});
      });

      it('renders all of the host names', function() {
        expect('.desired-lrp').toContainText('foo.com');
        expect('.desired-lrp').toContainText('bar.com');
      });
    });
  });

  describe('when everything is running smoothly', function() {
    beforeEach(function() {
      actualLrps = React.addons.update(actualLrps, {2: {$merge: {state: 'RUNNING'}}});
      subject.setProps({actualLrps});
    });

    it('does not show any errors', function() {
      expect($('.desired-lrp.bg-error-1')).not.toExist();
    });
  });

  describe('when not all of the actualLrps are running', function() {
    it('marks the lrp with an error', function() {
      expect('.desired-lrp').toHaveClass('error');
    });

    it('adds a error icon to the container', function() {
      expect('.desired-lrp .app-container-sidebar .fa-exclamation-circle').toExist();
    });
  });

  describe('when there are extra actualLrps running', function() {
    beforeEach(function() {
      actualLrps = React.addons.update(actualLrps, {2: {$merge: {state: 'RUNNING'}}});
      actualLrps = React.addons.update(actualLrps, {$push: [Factory.build('actualLrp')]});
      subject.setProps({actualLrps});
    });

    it('does not show any errors', function() {
      expect($('.desired-lrp.bg-error-1')).not.toExist();
    });
  });

  describe('when there are actual lrps in the claimed state', function() {
    beforeEach(function() {
      actualLrps = React.addons.update(actualLrps, {2: {$merge: {state: 'CLAIMED'}}});
      subject.setProps({actualLrps});
    });

    it('adds the claimed class to the container', function() {
      expect('.app-container-sidebar.claimed').toExist();
    });
  });

  describe('when mouse over event is triggered on the desired lrp', function() {
    beforeEach(function() {
      $('.desired-lrp').simulate('mouseOver');
      jasmine.clock().tick(1000);
    });

    it('sets the hoverDesiredLrp on the receptor', function() {
      expect(selectionCallbackSpy).toHaveBeenCalledWith(jasmine.objectContaining({hoverDesiredLrp: desiredLrp}));
    });
  });

  describe('when user clicks it', function() {
    beforeEach(function() {
      $('.desired-lrp').simulate('click');
    });

    it('selects the lrp', function() {
      expect(selectionCallbackSpy).toHaveBeenCalledWith(jasmine.objectContaining({selectedDesiredLrp: desiredLrp}));
    });

    it('opens the sidebar', function() {
      expect(sidebarCallbackSpy).toHaveBeenCalledWith(jasmine.objectContaining({sidebarCollapsed: false}));
    });
  });
});