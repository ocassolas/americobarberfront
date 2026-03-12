pipeline {
    agent any

    environment {
        VPS_USER = "jenkins"
        VPS_IP = "72.61.47.148"
        SSH_CREDENTIALS_ID = "vps-ssh-key"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Determine Environment') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.DEPLOY_ENV = 'prod'
                        env.BUILD_CMD = 'npm run build' // Uses .env.production by default usually
                    } else if (env.BRANCH_NAME == 'develop' || env.BRANCH_NAME == 'staging' || env.BRANCH_NAME == 'hml') {
                        env.DEPLOY_ENV = 'hml'
                        env.BUILD_CMD = 'npm run build -- --mode staging' // Adjust based on your scripts
                    } else {
                        error "Branch ${env.BRANCH_NAME} is not configured for deployment."
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                sh "${env.BUILD_CMD}"
            }
        }

        stage('Deploy to VPS') {
            steps {
                sshagent([SSH_CREDENTIALS_ID]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${VPS_USER}@${VPS_IP} "mkdir -p /var/www/americobarber/${env.DEPLOY_ENV}"
                        scp -o StrictHostKeyChecking=no -r dist/* ${VPS_USER}@${VPS_IP}:/var/www/americobarber/${env.DEPLOY_ENV}/
                    """
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
