var Cells = require('./cells');
var PureRenderMixin = require('../mixins/pure_render_mixin');
var React = require('react/addons');
var ReceptorMixin = require('../mixins/receptor_mixin');
var PUI = Object.assign({}, {
  Icon: require('../vendor/icon').Icon,
  RadioGroup: require('../vendor/radio-group').RadioGroup,
  Radio: require('../vendor/radio').Radio
});

var types = React.PropTypes;

var Zones = React.createClass({
  mixins: [PureRenderMixin, ReceptorMixin],

  propTypes: {
    $receptor: types.object,
    $scaling: types.object.isRequired,
    $selection: types.object,
    $sidebar: types.object
  },

  changeScale(scaling) {
    this.props.$scaling.set(scaling);
  },

  renderZones: function() {
    var {$receptor, $selection, $scaling, $sidebar} = this.props;
    var cells = $receptor.get('cells');
    if (!cells) return null;

    var zones = cells.reduce(function(zones, cell){
      var zone = zones[cell.zone] || [];
      zone.push(cell);
      zones[cell.zone] = zone;
      return zones;
    }, {});

    var scaling = $scaling.get();
    return Object.keys(zones).sort().map(function(zone) {
      var cells = this[zone];
      return (
        <div className="zone" key={zone}>
          <header><h2>{`Zone ${zone} - ${cells.length} Cells`}</h2></header>
          <Cells {...{cells, scaling, $receptor, $selection, $sidebar}}/>
        </div>
      );
    }, zones);
  },

  render() {
    var scaling = this.props.$scaling.get();
    return (
      <div className="zones pam">
        <header className="form-inline">
          <PUI.RadioGroup name="scale_type" onChange={this.changeScale}>
            <span className="type-neutral-10">
              <PUI.Icon name="refresh" className="refresh mrm" onClick={this.updateReceptor}/>
              Container Scaling:
            </span>
            <PUI.Radio value="containers" checked={scaling === 'containers'}> containers</PUI.Radio>
            <PUI.Radio value="memory_mb" checked={scaling === 'memory_mb'}> memory</PUI.Radio>
            <PUI.Radio value="disk_mb" checked={scaling === 'disk_mb'}> disk</PUI.Radio>
          </PUI.RadioGroup>
        </header>
        {this.renderZones()}
      </div>
    );
  }
});

module.exports = Zones;