/**
 * Module Dependencies
 */

var path = require('path');
var join = path.join;
var Email = require('../')

/**
 * Send an email
 */

var email = new Email;

email
  .from('mattmuelle@gmail.com')
  .to('mattmuelle@gmail.com')
  .subject('wahoo! {name}', { name : 'matt' })
  .body(join(__dirname, 'body.jade'))
  .style(join(__dirname, 'body.css'))
  .send(function(err) {
    if (err) throw err;
  });
