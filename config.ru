require 'bundler'
Bundler.require

if !ENV['RACK_ENV'] || ENV['RACK_ENV'] == 'development'
  ENV['QS_DEVCENTER_BACKEND_URL'] = 'http://devcenter-backend.dev/v1'
  ENV['QS_CANVAS_APP_HOST'] = 'http://canvas-app.dev/'
  ENV['QS_S3_HOST'] = "http://s3.amazonaws.com/game_uploads/"
  ENV['QS_OAUTH_SITE'] = 'http://auth-backend.dev/'
  ENV['QS_OAUTH_CLIENT_ID'] = "f3f2b27f4baed577d2f631e77fd8a068361281ca56edfed07b8cf4392044bd83"
  ENV['QS_OAUTH_CLIENT_SECRET'] = "b402c89ec06f9f210f4d6a3d88e71675238bb4a38752375a4fad4c0ab646e122"

  # Make sure to set the S3 access key ID and secret manually before
  # starting your server:
  # ENV['QS_S3_KEY_ID'] = '...'
  # ENV['QS_S3_KEY_SECRET'] = '...'
end

ENV_KEYS_TO_EXPOSE = ['QS_DEVCENTER_BACKEND_URL', 'QS_CANVAS_APP_HOST', 'QS_S3_HOST', 'QS_OAUTH_SITE']


if ENV['RACK_ENV'] == 'production'
  use Rack::Auth::Basic, "Sample Dev App" do |username, password|
      'redwoodpho' == password
  end
end

require File.expand_path('../backend/s3_browser_form.rb', __FILE__)
require File.expand_path('../backend/sso/auth_backend.rb', __FILE__)

use Rack::Session::Cookie
use OmniAuth::Builder do
  provider :auth_backend, ENV['QS_OAUTH_CLIENT_ID'], ENV['QS_OAUTH_CLIENT_SECRET']
end

map "/auth/auth_backend/callback" do
  run Proc.new { |env|
    response = Rack::Response.new('', 301, 'Location' => '/')
    response.set_cookie('qs_authentication', value: JSON.dump(env['omniauth.auth']), path: '/')

    response
  }
end

map "/" do
  root = File.dirname(__FILE__)
  brochure = Brochure.app(root, {}) do |app|
    app.template_root.gsub!(/^.*$/, File.expand_path('./app', root))
    app.asset_root.gsub!(/^.*$/, File.expand_path('./app', root))
  end

  run brochure
end
