/* eslint-env node, mocha */
const Clients = require('../lib/clients')

const goodPublic = '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAsaKPfuecUERWadr3wdNB2OFlCTSttzzoFlL2/MNh+k7Qhb0stQLXCoPe3TWh\nUsnyP7R13c9fTkpfcBo40NgYVz8eshANtTboZa1rfAGuM4S6I+Gj/AiMyxu4u4jgVtnAdPjY\nGRwUUIsII/oW1czCWb7iHW6ED+/xVILK+iXOqs/qEQnY9s2yhKfvWmYAnD29m1WJMNC+vDE7\nRpHyUvoL0S952FeyVEPiEbtbgPGH51QZG261s38CqObMN88cvrHTqPNQMxRml2EeMpeRIz1p\nNtD4De0mLKOX9EojfLzJFJcp3B2vB5FxpdzZg18EbtRP8Asos66D/zEfeG1+V5MnpQIDAQAB\n-----END RSA PUBLIC KEY-----\n'
const goodPrivate = '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAsaKPfuecUERWadr3wdNB2OFlCTSttzzoFlL2/MNh+k7Qhb0stQLXCoPe\n3TWhUsnyP7R13c9fTkpfcBo40NgYVz8eshANtTboZa1rfAGuM4S6I+Gj/AiMyxu4u4jgVtnA\ndPjYGRwUUIsII/oW1czCWb7iHW6ED+/xVILK+iXOqs/qEQnY9s2yhKfvWmYAnD29m1WJMNC+\nvDE7RpHyUvoL0S952FeyVEPiEbtbgPGH51QZG261s38CqObMN88cvrHTqPNQMxRml2EeMpeR\nIz1pNtD4De0mLKOX9EojfLzJFJcp3B2vB5FxpdzZg18EbtRP8Asos66D/zEfeG1+V5MnpQID\nAQABAoIBAQCt/UwQQUwaUtVRWejTMNmOVTdhjPeaQ04Qj7LcYYPWaNxWIrVnlyCKbCAfDCi3\nrpZZT6kjWbtANBjG9Ogxp3gv/ONUBeVnWiDHdtWQ4RR/4cFw49J7SuSdDMok5izW5PJdoGAK\nODatrYCLvKohQC4dOZrAuT8hXSREYtftrJqBMwNgYxZZxo5JRiZI/wIcwEtYgTA85/62U8UU\nnVw6oRXaSwqq5cSeq89aZs6Hx8XPWXGnm9wjgKNV+NuJLRvAs7x9gyIQVeQ1l0wG6UVeOet5\nHzm7xCd/qTvaO7kXvo6/6VRjRxpaTGBvqaGP6svKtnRpiUcPSSmclUkZcKpq/QgBAoGBANvO\nxIYF6Pd1MAEJrgvAS/fR/5iiKxK09gil9EVKDwHSYPVnLFsh2EZBcd8PQ6SEjH4eM3AsPRKo\nDEW2W88VbZfjkXPywp+4+iw2+eoYzmLlkZHzz/K/hyDqY9y/40k3VKV/cjLCx1y0nC5MzyJb\nsBbKf9m+PYGKGkdZEuANow0pAoGBAM7iJjjraxRUTNykzBNgZsPmoz2lRDChEFYy+6mfAbBt\nMSVHoNBqYPXi9VnNOCvHulRI+3K1FcE0jcH3luOOZ7jlCGcFZHRh3Z9r9it6Oqm4EHz3J8ez\nvo6Bo1Pup1HtoFzAGgLmMr+1vizl29UZg23aQl9zdmXZJT4HpF2asJodAoGAGeHmCDYH8aON\n7IFcSivxhhPnOezWj5RZaDlKYyJOVBOWsS7d7Tk2A0fPhcmBWIz3Eh6yReIfquO41jib5O2M\nAxeb2ABc5HvekXhDw0n6e3C2zG3eLaJZ4glXivXZaJSoVfiE1O9UlFj8DwOiXFRZjsV3eodJ\nLMi7QW1+qH1SlskCgYAtmi/usAXkb0iaAkFxq/g7CmXFOt6zEW22cnqCwyfuKcOBgi5ygmBp\nEuQeLVxKWjY6SfQTLtNiySDONrMt6b/3Q5T8kHW6KbBeab/TiZfQvV/1C83a+UXxx6Wm5J5B\nMu38Q+P366IYHAmVf/1bFcqgtlGXFK5ueNT6vVh/wY9YCQKBgQAKFj0CzzNm/9V1E156p7M3\n1VgVB0Piw5wdnA2sLFXU/UAV/7qj7+EiaXZo2Un10SZnWxe7MAyw21C/h5Krs0+37RrLhEDR\nka8UAFhMFTtnCEbq4Zs/YXkVafnSu6emtiX03snHGT3L+BIxcuV7vOGetR8B3wRWRtdO8zSy\nTFEysA==\n-----END RSA PRIVATE KEY-----\n'

describe('Clients: handshake', () => {
  let good1, good2, bad1

  describe('First good client', () => {
    it('should be constructed correctly', () => {
      good1 = new Clients({
        hostname: 'good1',
        namespace: 'coucou',
        publicKey: goodPublic,
        privateKey: goodPrivate,
        db: {
          _getKey: () => { return goodPublic }
        },
        port: 45678
      })
    })

    it('should start correctly', () => {
      good1.start()
    })
  })

  describe('Second good client', () => {
    it('should be constructed correctly', () => {
      good2 = new Clients({
        hostname: 'good2',
        namespace: 'coucou',
        publicKey: goodPublic,
        privateKey: goodPrivate,
        db: {
          _getKey: () => { return goodPublic }
        },
        port: 45679
      })
    })

    it('should detect connect and verify from good1', done => {
      let connected = false

      good2.once('connection', () => {
        connected = true
      })
      good2.once('verified', () => {
        console.log('  verified')
        if (connected) done()
      })
      good2.start()
    })
  })
})
