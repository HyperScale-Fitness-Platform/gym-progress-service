pipeline {
    agent any

    // Parameters allow overriding repository, branch and docker repo at runtime
    parameters {
        string(name: 'REPO_URL', defaultValue: 'https://github.com/HyperScale-Fitness-Platform/gym-progress-service', description: 'Git repository to build')
        string(name: 'REPO_BRANCH', defaultValue: 'main', description: 'Branch to checkout')
        string(name: 'DOCKER_IMAGE', defaultValue: 'ibrahim27501/gym-progress-service', description: 'Docker image repository (user/repo)')
        booleanParam(name: 'PUSH_IMAGE', defaultValue: false, description: 'Push image to Docker registry')
    }

    environment {
        // Fallback image name used when DOCKER_IMAGE param is empty
        IMAGE_NAME = "gym-${env.JOB_BASE_NAME.toLowerCase()}"
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    if (params.REPO_URL?.trim()) {
                        checkout([$class: 'GitSCM', branches: [[name: params.REPO_BRANCH]], userRemoteConfigs: [[url: params.REPO_URL]]])
                    } else {
                        // Default to the pipeline's configured SCM
                        checkout scm
                    }
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint Code') {
            steps {
                // Runs code quality check, skips if script doesn't exist in package.json
                sh 'npm run lint --if-present'
            }
        }

        stage('Run Tests') {
            steps {
                // Runs unit and integration test suite (uses mongodb-memory-server, no external DB needed)
                sh 'npm test --if-present'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    def img = params.DOCKER_IMAGE?.trim() ? params.DOCKER_IMAGE : IMAGE_NAME
                    sh "docker build -t ${img}:${env.BUILD_NUMBER} ."
                    sh "docker tag ${img}:${env.BUILD_NUMBER} ${img}:latest"

                    if (params.PUSH_IMAGE) {
                        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                            sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                            sh "docker push ${img}:${env.BUILD_NUMBER}"
                            sh "docker push ${img}:latest"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            // Standard cleanup step to prevent workspace bloat on the Jenkins runner
            cleanWs()
        }
        success {
            echo "CI pipeline completed successfully for build #${env.BUILD_NUMBER}!"
        }
        failure {
            echo "Pipeline failed on build #${env.BUILD_NUMBER}. Check console logs above."
        }
    }
}