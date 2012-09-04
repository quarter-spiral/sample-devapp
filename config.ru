require 'bundler'
Bundler.require

if !ENV['RACK_ENV'] || ENV['RACK_ENV'] == 'development'
  ENV['QS_DEVCENTER_BACKEND_URL'] = 'http://devcenter-backend.dev/v1'
end

app = Rack::Builder.new {
  use Rack::Rewrite do
    r301 %r{^(.*\/)$}, '$1index.html'
  end

  if ENV['RACK_ENV'] == 'production'
    use Rack::Auth::Basic, "Sample Dev App" do |username, password|
        'redwoodpho' == password
    end
  end

  root = File.dirname(__FILE__)
  brochure = Brochure.app(root, {}) do |app|
    app.template_root.gsub!(/^.*$/, File.expand_path('./app', root))
    app.asset_root.gsub!(/^.*$/, File.expand_path('./app', root))
  end

  run brochure
}

run app
