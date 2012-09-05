require 'bundler'
Bundler.require

if !ENV['RACK_ENV'] || ENV['RACK_ENV'] == 'development'
  ENV['QS_DEVCENTER_BACKEND_URL'] = 'http://devcenter-backend.dev/v1'
  ENV['QS_CANVAS_APP_HOST'] = 'http://canvas-app.dev/'
  ENV['QS_S3_HOST'] = "http://s3.amazonaws.com/game_uploads/"

  # Make sure to set the S3 access key ID and secret manually before
  # starting your server:
  # ENV['QS_S3_KEY_ID'] = '...'
  # ENV['QS_S3_KEY_SECRET'] = '...'
end

if ENV['RACK_ENV'] == 'production'
  use Rack::Auth::Basic, "Sample Dev App" do |username, password|
      'redwoodpho' == password
  end
end

load File.expand_path('../backend/s3_browser_form.rb', __FILE__)

root = File.dirname(__FILE__)
brochure = Brochure.app(root, {}) do |app|
  app.template_root.gsub!(/^.*$/, File.expand_path('./app', root))
  app.asset_root.gsub!(/^.*$/, File.expand_path('./app', root))
end

run brochure
