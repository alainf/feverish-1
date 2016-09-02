/* globals $ */
$(function () {
  'use strict'
  const student = $('body').data('student')
  $.getJSON('/_users/org.couchdb.user:' + student, function (userDoc) {
    var r
    var $me
    $('.exercice').append('<pre>Aucun résultat</pre>').hide()
    if (userDoc.corrections) {
      for (r in userDoc.corrections) {
        $me = $('pre', '#' + r)
        $me.text(JSON.stringify(userDoc.corrections[r], null, ' '))
        $me.parents('.exercice').slideDown()
      }
    }
  })
})
