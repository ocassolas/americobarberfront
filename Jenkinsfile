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
                    String branch = env.BRANCH_NAME ?: env.GIT_BRANCH ?: ""
                    
                    if (branch.contains('/')) {
                        branch = branch.split('/')[-1]
                    }

                    echo "Detected branch: ${branch}"

                    if (branch == 'main') {
                        env.DEPLOY_ENV = 'prod'
                        env.BUILD_CMD = 'npm run build'
                    } else if (branch == 'hml' || branch == 'develop' || branch == 'staging') {
                        env.DEPLOY_ENV = 'hml'
                        env.BUILD_CMD = 'npm run build -- --mode staging'
                    } else {
                        error "Branch '${branch}' is not configured for deployment."
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
