require 'base64'
require 'openssl'
require 'digest/sha1'
require 'uri'
require 'cgi'

class S3BrowserForm
  MINUTE = 60
  KILOBYTE = 1024
  MEGABYTE = 1024 * KILOBYTE

  def initialize(request)
    @request = request
    @initial_time = Time.now
  end

  def to_html
<<-EOS
    <form action="https://#{ENV['QS_S3_BUCKET']}.s3.amazonaws.com/" method="post" enctype="multipart/form-data">
      <input type="hidden" name="key" value="#{CGI.escapeHTML(file_name)}">
      <input type="hidden" name="AWSAccessKeyId" value="#{ENV['QS_S3_KEY_ID']}">
      <input type="hidden" name="acl" value="#{acl}">
      <input type="hidden" name="success_action_redirect" value="#{redirect_url}">
      <input type="hidden" name="policy" value="#{policy}">
      <input type="hidden" name="signature" value="#{signature}">
      <input type="hidden" name="Content-Type" value="#{content_type}">

      <input name="file" type="file" />
      <button class="btn btn-info">Upload SWF</button>
    </form>
EOS
  end

  protected
  def params
    Hash[@request.query_string.split('&').map {|e| e.split('=') }]
  end

  def game
    params['game']
  end

  def file_name
    unique_id = (@initial_time.to_f * 1000).round
    @file_name = "game_uploads/#{game}/#{unique_id}.swf"
  end

  def policy
    expires_at = Time.now + 5 * MINUTE

    @policy ||= Base64.encode64(JSON.dump(
      expiration: expires_at.utc.strftime("%Y-%m-%dT%H:%M:%SZ"),
      conditions: [
        {bucket: ENV['QS_S3_BUCKET']},
        {"key" => file_name},
        {acl: acl},
        {success_action_redirect: redirect_url},
        {"Content-Type" => content_type},
        ["content-length-range", 0, 50 * MEGABYTE]
      ]
    )).gsub("\n","")
  end

  def signature
    Base64.encode64(
      OpenSSL::HMAC.digest(
        OpenSSL::Digest::Digest.new('sha1'),
        ENV['QS_S3_KEY_SECRET'], policy
      )
    ).gsub("\n", "")
  end

  def acl
    'public-read'
  end

  def content_type
    'application/x-shockwave-flash'
  end

  def redirect_url
    url = "#{@request.scheme}://#{@request.host}"
    unless (@request.scheme == 'http' && @request.port == 80) || (@request.scheme == 'https' && @request.port == 443)
      url += ":#{@request.port}"
    end
    url += @request.path_info.gsub(/\/[^\/]+$/, '/upload_done.html')
    URI.escape(url)
  end
end
