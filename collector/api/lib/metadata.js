var AmpersandCollection = require('ampersand-collection');

var Metadata = AmpersandCollection.extend({
  mainIndex: 'source'
});

/*
  Convenience method to see if each item
  exists in the collection and to remove
  it and add the new one if it does
*/
Metadata.prototype.replace = function (data) {
  if (data.forEach) {
    data.forEach(this.replace.bind(this));
  } else {
    if ( this.get(data.source) ) {
      this.remove(data, { silent: true });
    }
    this.add(data);
  }
}

module.exports = Metadata;