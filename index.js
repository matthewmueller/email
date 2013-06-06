/**
 * Module Dependencies
 */

var Mail = require('email').Email;
var cons = require('consolidate');
var juice = require('juice').juiceContent;
var Batch = require('batch');
var fs = require('fs');
var read = fs.readFile;
var path = require('path');
var extname = path.extname;

/**
 * Export `Email`
 */

module.exports = Email;

/**
 * Initialize Email
 *
 * @return {Email}
 * @api public
 */

function Email() {
  if (!(this instanceof Email)) return new Email;
  this.tos = [];
}

/**
 * To
 *
 * @param {String} to
 * @return {Email}
 * @api public
 */

Email.prototype.to = function(to) {
  this.tos.push(to);
  return this;
};

/**
 * From
 *
 * @param {String} from
 * @return {Email}
 * @api public
 */

Email.prototype.from = function(from) {
  this._from = from;
  return this;
};

/**
 * Subject
 *
 * @param {String} subject
 * @param {Object} obj
 * @return {Email}
 * @api public
 */

Email.prototype.subject = function(subject, obj) {
  this._subject = (obj) ? template(subject, obj) : subject;
  return this;
};

/**
 * Body
 *
 * @param {String} filename
 * @param {Object} obj
 * @return {Email}
 * @api public
 */

Email.prototype.body = function(filename, obj) {
  this.body = filename;
  this.obj = obj || {};
  return this;
};

/**
 * Add a stylesheet
 *
 * @param {String} filename
 * @return {Email}
 * @api public
 */

Email.prototype.style = function(filename) {
  this.css = filename;
  return this;
};

/**
 * Send the email
 *
 * @param {Function} fn
 * @return {Email}
 * @api public
 */

Email.prototype.send = function(fn) {
  var self = this;
  var ext = extname(this.body).slice(1);
  var compiler = cons[ext];
  if (!compiler) return fn(new Error('Cannot find compiler: ' + ext));

  // compile template => html
  compiler(this.body, this.obj, function(err, html) {
    if (err) return fn(err);
    read(self.css, 'utf8', function(err, css) {
      if (err) return fn(err);
      // TODO: figure out proper url
      juice(html, { extraCss: css, url: '/' }, function(err, html) {
        if (err) return fn(err);
        send(html);
      })
    });
  });

  function send(html) {
    var tos = self.tos;
    var batch = new Batch;

    tos.forEach(function(to) {
      batch.push(function(done) {
        new Mail({
          from: self._from,
          to: to,
          subject: self._subject,
          body: html,
          bodyType: 'html'
        }).send(done);
      });
    });

    batch.end(fn);
  }
};

/**
 * Single line templating
 *
 * @param {String} tpl
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function template(tpl, obj) {
  return tpl.replace(/\{([^\}]+)\}/g, function(match, key) {
    return obj[key] || '';
  });
}
