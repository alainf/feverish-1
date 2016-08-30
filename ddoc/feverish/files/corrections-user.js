/* globals $ */
$(function () {
  'use strict'
  const score = function ($form, ponderation) {
    const ret = { ponderation: ponderation }
    $form.serializeArray().forEach(function (x) { ret[x.name] = x.value })
    ret.note = parseFloat(ret.note)
    ret.ponderation = parseFloat(ret.ponderation)
    ret.createdAt = new Date().toISOString()
    return ret
  }

  const bodyData = $('body').data()
  var userDoc
  var referenceUser

  $.getJSON(
    '/_users/_all_docs',
    {
      startkey: '"org.couchdb.user:"',
      endkey: '"org.couchdb.user:\ufff0"',
      include_docs: true
    },
    function (data) {
      referenceUser = data.rows
        .filter(function (row) {
          return row.doc.corrections &&
            row.doc.corrections[bodyData.exercice] &&
            row.doc.corrections[bodyData.exercice].reference &&
            row.doc.name !== bodyData.student
        })
        .map(function (row) { return row.doc })[0]
    }
  )

  $('#reference-label').change(function (ev) {
    const successFn = errorFn = function () { }

    if ($(this).prop('checked')) {
      if (referenceUser) {
        if (window.confirm('Remplacer ' + referenceUser.name + '?')) {
          delete referenceUser.corrections[bodyData.exercice].reference
          $.ajax({
            url: '/_users/' + referenceUser._id,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(referenceUser),
            error: errorFn,
            success: successFn
          })
        } else {
          $(this).prop('checked', false)
        }
      }
    }
  })

  const userUrl = '/_users/org.couchdb.user:' + bodyData.student
  $.getJSON(userUrl, function (ud) {
    userDoc = ud
    const exData = userDoc.corrections && userDoc.corrections[bodyData.exercice]
    if (exData) {
      $('#note-label').val(exData.note)
      $('#commentaires-label').text(exData.commentaires)
      if (exData.reference) { $('#reference-label').prop('checked', true) }
    }
  })

  $('form').submit(function (ev) {
    ev.preventDefault()
    const $form = $(this)

    if (!userDoc.corrections) { userDoc.corrections = { } }
    userDoc.corrections[bodyData.exercice] = score($form, bodyData.ponderation)

    // const completeFn = function (a, b, c) { console.log('completeFn', a, b, c) }
    const errorFn = function (a, b, c) { console.log('errorFn', a, b, c) }
    const successFn = function (a, b, c) {
      console.log('successFn', a, b, c)
      // FIXME: redirect to next student
      $('input[type="submit"]').addClass('success').val('Merci!')
      $form.prop('disabled', true)
    }

    $.ajax({
      url: userUrl,
      method: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify(userDoc),
      // complete: completeFn,
      error: errorFn,
      success: successFn
    })
  })
})
