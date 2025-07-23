# Badges Branch

This branch contains badge data for the CoinPlex SDK test results.

## Badge Files

- `badges/overall.json` - Overall test status (6/6 tests)
- `badges/wallet.json` - Wallet API test status  
- `badges/financial.json` - Financial API test status
- `badges/user.json` - User API test status
- `badges/income.json` - Income API test status
- `badges/quantify.json` - Quantify API test status
- `badges/ads.json` - Ads API test status

## Badge URLs

- Overall: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/krystianslowik/coinplex-sdk/badges/badges/overall.json`
- Individual modules: `https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/krystianslowik/coinplex-sdk/badges/badges/[module].json`

## Automated Updates

This branch is automatically updated by GitHub Actions whenever tests are run on the main branch.