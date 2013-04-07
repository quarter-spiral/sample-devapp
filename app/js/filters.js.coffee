# Filters
@angular.module("devcenterTest.filters", []).filter("interpolate", ["version", (version) ->
  (text) ->
    String(text).replace /\%VERSION\%/g, version
]).filter("canvasUrl", [->
  (gameUuid, venue) ->
    String "#{qs.ENV.QS_CANVAS_APP_URL}/v1/games/#{gameUuid}/#{venue}"
]).filter("gameReady", [->
  (game) ->
    return false unless game
    return false if !game.configuration or game.configuration.type is 'initial'

    ready = false
    for venue, config of game.venues
      ready = ready || (config.enabled and config.computed and config.computed.ready)
    ready
]).filter("rollingImpressionsChartData", [->
  (insights) ->
    return null unless insights
    data = []
    i = 0
    for view in insights.impressions.overall.anonymous.rolling_30_days
      data.push(view + insights.impressions.overall.logged_in.rolling_30_days[i])
      i++

    data
])