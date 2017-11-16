node('docker-build') {
    checkout([
        $class: 'GitSCM',
        branches: [[name: 'refs/heads/master']],
        doGenerateSubmoduleConfigurations: false,
        extensions: [[$class: 'CloneOption', depth: 0, honorRefspec: true, noTags: true, reference: '', shallow: true]],
        submoduleCfg: [],
        userRemoteConfigs: [[credentialsId: 'GitHub-IntergralAdmin', url: 'https://github.com/intergral/ngx-datatable.git']]
    ])

    /* Requires the Docker Pipeline plugin to be installed */
    docker.image('node:7-slim').inside('--user=root') {
        stage('build') {
            sh 'npm install'
        }
        stage('deploys') {
            parallel 'deploy-npm': {
                sh 'npm run package'
                sh 'npm version --no-git-tag-version 1.0.$BUILD_NUMBER'
                withCredentials([string(credentialsId: 'NPM_AUTH_TOKEN', variable: 'npm_auth')]) {
                    sh 'echo "//registry.npmjs.org/:_authToken=$npm_auth" > ~/.npmrc'
                }
                sh 'cp package.json release'
                sh 'cd release && npm publish --access public'
            }
        }
    }
}