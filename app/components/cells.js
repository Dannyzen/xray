var React = require('react/addons');
var Cell = require('./cell');
var PureRenderMixin = require('../mixins/pure_render_mixin');

var types = React.PropTypes;

var Cells = React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    cells: types.array,
    scaling: types.string.isRequired,
    $receptor: types.object,
    $selection: types.object,
    $sidebar: types.object
  },

  render() {
    var {cells, scaling, $receptor, $selection, $sidebar} = this.props;
    cells = cells && cells.map(function(cell) {
      var key = cell.cell_id;
      var actualLrps = ($receptor.get('actualLrps') || []).filter(lrp => lrp.cell_id === key);
      var props = {actualLrps, cell, scaling, $receptor, $selection, $sidebar, key};
      return (<Cell {...props}/>);
    }, this);

    return (
      <div className="cells">
        <ul className="pan">{cells}</ul>
      </div>
    );
  }
});

module.exports = Cells;