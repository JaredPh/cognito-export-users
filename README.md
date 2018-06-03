# cognito-export-users

## Install
```
npm install -g cognito-export-users
```

## Usage
```
cognito-export-users <user-pool-id> <options>
    
AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY can be specified in env variables or ~/.aws/credentials

Options
  --file File name to export/import single pool users to (defaults to user-pool-id.json)
  --dir Path to export all pools, all users to (defaults to current dir)
      
```

## Examples
```
cognito-export-users eu-west-1_1_12345
cognito-export-users eu-west-1_1_12345 --file mypool.json
cognito-export-users eu-west-1_1_12345 --dir output
```

