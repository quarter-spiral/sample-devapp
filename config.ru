require 'bundler'
Bundler.require

unless ENV['RACK_ENV']
  ENV['QS_DEVCENTER_BACKEND_URL'] = 'http://devcenter-backend.dev/v1'
end

class EnvInjector
  def initialize(app)
    @app = app

    envs = Hash[ENV.keys.select {|k| k.start_with?('QS_')}.map {|k| [k,ENV[k]]}]
    body = <<-EOS
window.qs = window.qs || {};
window.qs.ENV = #{JSON.dump(envs)};
    EOS

    @env_response = [200, {'Content-Type' => 'application/javascript'}, [body]]
  end

  def call(env)
    if env['PATH_INFO'] == '/js/dynamic/envs.js'
      @env_response
    else
      @app.call(env)
    end
  end
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

  use EnvInjector
  use Rack::Static, :urls => ["/"], :root => 'app'
  use Rack::ShowExceptions

  run lambda {|env|
    [404, {}, ['Not found']]
  }
}

run app
