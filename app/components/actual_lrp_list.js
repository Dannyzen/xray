var ActualLrp = require('./actual_lrp');
var classnames = require('classnames');
var PureRenderMixin = require('pui-cursor/mixins/pure-render-mixin');
var React = require('react');

var types = React.PropTypes;

var ActualLrpList = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    actualLrps: types.array.isRequired,
    $hoverActualLrp: types.object.isRequired,
    $hoverSidebarActualLrp: types.object.isRequired
  },

  renderActualLrps() {
    var {$hoverActualLrp, $hoverSidebarActualLrp} = this.props;
    return this.props.actualLrps.map(function(actualLrp) {
      var className = classnames({hover: $hoverSidebarActualLrp.get() === actualLrp});
      return (<ActualLrp {...{className, actualLrp, $hoverActualLrp, $hoverSidebarActualLrp, key: actualLrp.index}}/>);
    });
  },

  render() {
    return (
      <div className="actual-lrps">
        <table className="table">
          <tbody>{this.renderActualLrps()}</tbody>
        </table>
      </div>
    );
  }
});

module.exports = ActualLrpList;