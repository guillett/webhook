require 'openssl'

secret = "secret"
data = "content"
mac = OpenSSL::HMAC.hexdigest("SHA256", secret, data)

puts(data)
puts(mac)
