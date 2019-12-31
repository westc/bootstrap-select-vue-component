(function () {
  var DEFAULT_TITLE = 'Select Something'
  var propMapping = [
    'actionsBox',
    'countSelectedText',
    'deselectAllText',
    'dropdownAlignRight',
    'dropupAuto',
    'header',
    'hideDisabled',
    'iconBase',
    'liveSearch',
    'liveSearchNormalize',
    'liveSearchPlaceholder',
    'liveSearchStyle',
    'maxOptions',
    'maxOptionsText',
    'mobile',
    'multipleSeparator',
    'noneResultsText',
    'noneSelectedText',
    { camel: 'nullText', dash: 'title' },
    'selectAllText',
    'selectedTextFormat',
    'selectOnTab',
    'showContent',
    'showIcon',
    'showSubtext',
    'showTick',
    'size',
    'buttonClass',
    'tickIcon',
    'virtualScroll',
    'width',
    'windowPadding'
  ].map(function(a) {
    a = 'object' === typeof a ? a : { camel: a, dash: a };
    return {
      camelName: a.camel,
      dashName: a.dash.replace(/[A-Z]/g, '-$&').toLowerCase()
    }
  });

  var props = [
    'value',
    'options',
    'multiple',
    'valueKey',
    'textKey',
    'subtextKey',
    'id',
    'name'
  ].concat(propMapping.map(function(a){return a.camelName}));

  var watch = {
    // NOTE:  This will be called twice whenever the value is set as a non-array.
    value: function (newValue) {
      this.$emit('input', this.validateValue(newValue));
    }
  };

  propMapping.forEach(function(a) {
    watch[a.camelName] = function (value) {
      jQuery(this.$refs.select).data(a.dashName, value);
      this.rerender();
    };
  });

  var templateArray = propMapping.map(function(a) {
    if (a.camelName === 'nullText') {
      return '  :data-' + a.dashName + '="selectionCount?null:' + a.camelName + '"';
    }
    return '  :data-' + a.dashName + '="' + a.camelName + '"';
  });
  templateArray = [
    '<select',
    '  :multiple="multiple"',
    '  @change="updateFromSelect"',
    '  :id="id"',
    '  :name="name"',
    '  class="form-control bsv-select"',
    '  :data-style="buttonClassName"',
    '  data-is-unrendered="true"'
  ].concat(templateArray).concat([
    '  ref="select"',
    '>',
    '  <option v-for="option in realOptions" is-real="1" :value="option.value" :data-subtext="option.subtext" :selected="option.selected">{{ option.text }}</option>',
    '</select>'
  ]);
  var template = templateArray.join('\n');

  Vue.component('bootstrap-select', {
    props: props,
    mounted: function() {
      this.rerender();

      // Validate value on initialization.
      this.$emit('input', this.validateValue());
    },
    updated: function () {
      this.refresh();
    },
    watch: watch,
    methods: {
      rerender: function () {
        var jElem = jQuery(this.$refs.select);
        if (jElem.data('is-unrendered')) {
          jElem.data('is-unrendered', false);
        }
        else {
          jElem.selectpicker('destroy');
        }
        jElem.selectpicker();
      },
      refresh: function () {
        var jSelect = jQuery(this.$refs.select);
        if (!this.value.length) {
          jSelect.selectpicker({ title: this.nullText || DEFAULT_TITLE });
          jSelect.selectpicker('render');
        }
        jSelect.selectpicker('refresh');
      },
      validateValue: function(value) {
        if (arguments.length === 0) {
          value = this.value;
        }
        return value == undefined ? [] : Array.isArray(value) ? value : [value];
      },
      updateFromSelect: function () {
        var indices = this.getSelectedOptionElementIndices();
        var realOptions = this.realOptions;
        this.$emit('input', indices.map(function(i) { return realOptions[i].value; }));
      },
      getOptionElements: function() {
        var options = this.$refs.select.options;
        for (var option, arr = [], i = 0, l = options.length; i < l; i++) {
          option = options[i];
          if (option.getAttribute('is-real')) {
            arr.push(option);
          }
        }
        return arr;
      },
      getSelectedOptionElementIndices: function() {
        return this.getOptionElements().reduce(function(indices, o, i) {
          if (o.selected) {
            indices.push(i);
          }
          return indices;
        }, []);
      }
    },
    computed: {
      selectionCount: function () {
        return this.validateValue().length;
      },
      buttonClassName: function () {
        return this.buttonClass || 'btn-bootstrap-select';
      },
      optionsArray: function () {
        var options = this.options;
        return options == undefined ? [] : Array.isArray(options) ? options : [options];
      },
      realOptions: function () {
        var valueKey = this.valueKey == undefined ? 'value' : this.valueKey;
        var textKey = this.textKey == undefined ? 'text' : this.textKey;
        var subtextKey = this.subtextKey == undefined ? 'subtext' : this.subtextKey;
        var showSubtext = this.showSubtext;
        
        var values = this.validateValue().slice();
        
        return this.optionsArray.map(function (oldOption, index) {
          var option;
          if ('object' === typeof oldOption && oldOption != undefined) {
            option = {
              value: oldOption[valueKey],
              text: oldOption[textKey],
              subtext: showSubtext ? oldOption[subtextKey] : undefined
            };
          }
          else {
            option = {
              value: oldOption,
              text: oldOption
            };
          }

          // Determine if this option is selected.
          option.selected = false;
          for (var i = 0, l = values.length; i < l; i++) {
            var value = values[i];
            if (option.selected = value !== value ? option.value !== option.value : (option.value === value)) {
              values.splice(i, 1);
              break;
            }
          }
          return option;
        });
      }
    },
    template: template
  });

  // Adds the .bsv-select style.
  var style = document.createElement('style');
  style.innerHTML = '.bsv-select { border: 1px solid #ced4da !important; }';
  document.head.appendChild(style);
})();
