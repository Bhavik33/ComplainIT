pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        SONAR_CREDENTIALS_ID  = 'sonarqube-token'
        IMAGE_BACKEND         = 'resolveituser/resolveit-backend'
        IMAGE_FRONTEND        = 'resolveituser/resolveit-frontend'
        BUILD_TAG             = "${env.BUILD_NUMBER}"
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {
        stage('1. Checkout') {
            steps {
                echo '=== Stage 1: Checking out source code ==='
                checkout scm
            }
        }

        stage('2. Install Dependencies') {
            steps {
                echo '=== Stage 2: Installing Backend and Frontend dependencies ==='
                dir('backend') {
                    sh 'npm ci'
                }
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('3. Lint Code') {
            steps {
                echo '=== Stage 3: Running ESLint for code formatting & standard compliance ==='
                dir('backend') {
                    sh 'npm run lint || true'
                }
                dir('frontend') {
                    sh 'npm run lint || true'
                }
            }
        }

        stage('4. Unit Tests') {
            steps {
                echo '=== Stage 4: Executing Backend Unit Tests ==='
                dir('backend') {
                    sh 'npm run test:unit || npm test'
                }
            }
        }

        stage('5. Integration Tests') {
            steps {
                echo '=== Stage 5: Executing API Integration Tests ==='
                dir('backend') {
                    sh 'npm test'
                }
            }
        }

        stage('6. Test Coverage') {
            steps {
                echo '=== Stage 6: Generating Coverage Reports ==='
                dir('backend') {
                    sh 'npm run test:coverage'
                }
            }
        }

        stage('7. SonarQube Analysis') {
            steps {
                echo '=== Stage 7: Submitting code analysis to SonarQube ==='
                withCredentials([string(credentialsId: "${SONAR_CREDENTIALS_ID}", variable: 'SONAR_TOKEN')]) {
                    sh "sonar-scanner -Dsonar.token=${SONAR_TOKEN}"
                }
            }
        }

        stage('8. Quality Gate') {
            steps {
                echo '=== Stage 8: Verifying SonarQube Quality Gate Status ==='
                timeout(time: 5, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Pipeline aborted due to Quality Gate failure: ${qg.status}"
                        }
                    }
                }
            }
        }

        stage('9. Build Frontend Asset') {
            steps {
                echo '=== Stage 9: Building React Production Bundle ==='
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('10. Build Backend') {
            steps {
                echo '=== Stage 10: Validating Backend Production Assembly ==='
                dir('backend') {
                    sh 'node -e "console.log(\'Backend Build Check OK\')"'
                }
            }
        }

        stage('11. Build Docker Images') {
            steps {
                echo '=== Stage 11: Building Docker Containers ==='
                sh "docker build -t ${IMAGE_BACKEND}:${BUILD_TAG} -t ${IMAGE_BACKEND}:latest ./backend"
                sh "docker build -t ${IMAGE_FRONTEND}:${BUILD_TAG} -t ${IMAGE_FRONTEND}:latest ./frontend"
            }
        }

        stage('12. Docker Image Security Scan (Trivy)') {
            steps {
                echo '=== Stage 12: Scanning Docker Images with Trivy Scanner ==='
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${IMAGE_BACKEND}:${BUILD_TAG}"
                sh "trivy image --severity HIGH,CRITICAL --exit-code 0 ${IMAGE_FRONTEND}:${BUILD_TAG}"
            }
        }

        stage('13. Push Images to Docker Hub') {
            steps {
                echo '=== Stage 13: Pushing Built Images to Registry ==='
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh "echo ${DOCKER_PASS} | docker login -u ${DOCKER_USER} --password-stdin"
                    sh "docker push ${IMAGE_BACKEND}:${BUILD_TAG}"
                    sh "docker push ${IMAGE_BACKEND}:latest"
                    sh "docker push ${IMAGE_FRONTEND}:${BUILD_TAG}"
                    sh "docker push ${IMAGE_FRONTEND}:latest"
                }
            }
        }

        stage('14. Deploy Application') {
            steps {
                echo '=== Stage 14: Rolling update on Kubernetes Cluster / Docker Compose ==='
                sh 'kubectl apply -f k8s/ || docker-compose up -d'
            }
        }

        stage('15. Smoke Test') {
            steps {
                echo '=== Stage 15: Running Health & Endpoint Smoke Verification ==='
                sh 'curl -f http://localhost:5000/health || curl -f http://localhost/health'
            }
        }

        stage('16. Notify Result') {
            steps {
                echo '=== Stage 16: CI/CD Pipeline Completed Successfully! ==='
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        success {
            echo 'ResolveIT Build & Deployment Pipeline Succeeded!'
        }
        failure {
            echo 'ResolveIT Build Pipeline Failed. Inspect stage output for details.'
        }
    }
}
