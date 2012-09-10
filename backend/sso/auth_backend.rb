require 'omniauth-oauth2'

class AuthBackend < OmniAuth::Strategies::OAuth2
  option :name, "auth_backend"
  option :client_options, {site: ENV['QS_OAUTH_SITE']}

  uid{ raw_info['id'] }

  info do
    {
      :name => raw_info['name'],
      :email => raw_info['email'],
      :uuid => raw_info['uuid']
    }
  end

  def raw_info
    @raw_info ||= access_token.get('/api/v1/me').parsed
  end
end