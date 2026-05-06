pipeline {
  agent any

  tools {
    jdk 'JDK17'
    maven 'Maven3'
    nodejs 'node18'
  }
  parameters {
    string(name: 'MANUAL_PR_ID', defaultValue: '', description: 'PR number to cleanup (classic pipeline only)')
  }
  environment {
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
    SONAR_PROJECT_KEY_BACKEND = 'task-manager-backend'
    SONAR_PROJECT_KEY_FRONTEND = 'task-manager-frontend'
    FRONTEND_IMAGE = 'mohamed510/task-manager-frontend'
    BACKEND_IMAGE = 'mohamed510/task-manager-backend'
  }

  stages {

    stage('Checkout') {
      steps {
        dir('backend') {
          git url: 'https://github.com/cheikhi51/Task-Manager-Backend.git',
              branch: "${env.BRANCH_NAME ?: 'main'}",
              credentialsId: 'git-creds'
        }
        dir('frontend') {
          git url: 'https://github.com/cheikhi51/Task-Manager-Frontend.git',
              branch: "${env.BRANCH_NAME ?: 'main'}",
              credentialsId: 'git-creds'
        }
        dir('terraform'){
          git url: 'https://github.com/cheikhi51/Task-manager-infra.git',
              branch: "main",
              credentialsId: 'git-creds'
        }
        dir('ArgoCD') {
          git url: 'https://github.com/cheikhi51/Task-Manager-K8s.git',
              branch: "main",
              credentialsId: 'git-creds'
      }
    }
    }

    stage('Backend Build & Test') {
      steps {
        dir('backend') {
          withCredentials([
            string(credentialsId: 'postgres-db-url', variable: 'DB_URL'),
            string(credentialsId: 'jwt-secret', variable: 'JWT_SECRET'),
            string(credentialsId: 'jwt-expiration', variable: 'JWT_EXPIRATION'),
            usernamePassword(
              credentialsId: 'postgres-db-credentials',
              usernameVariable: 'DB_USERNAME',
              passwordVariable: 'DB_PASSWORD'
            )
          ]) {
            bat '''
              set DB_DRIVER_CLASS_NAME=org.postgresql.Driver
              set DB_URL=%DB_URL%
              set DB_USERNAME=%DB_USERNAME%
              set DB_PASSWORD=%DB_PASSWORD%
              set JWT_SECRET=%JWT_SECRET%
              set JWT_EXPIRATION=%JWT_EXPIRATION%
              mvn clean compile
            '''
          }
        }
      }
    }

    stage('Frontend Build') {
      steps {
        dir('frontend') {
          bat '''
            npm install
            npm run build
            npm test -- --coverage --watchAll=false
          '''
        }
      }
    }

    stage('SonarQube Analysis stage') {
      steps {
        withSonarQubeEnv('SonarQube') {
          script {
            def scannerHome = tool 'SonarScanner'
            
            dir('backend') {
              bat """
                mvn sonar:sonar ^
                -Dsonar.projectKey=%SONAR_PROJECT_KEY_BACKEND% ^
                -Dsonar.host.url=%SONAR_HOST_URL%
              """
            }
          }
        }
      }
    }

    stage('Build & Scan Docker Images') {
      parallel {
        stage('Backend') {
          steps {
            bat "docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% backend"
            bat """
              trivy image ^
                --cache-dir "%USERPROFILE%\\.cache\\trivy" ^
                --scanners vuln ^
                --severity HIGH,CRITICAL ^
                %BACKEND_IMAGE%:%BUILD_NUMBER%
            """
          }
        }
        stage('Frontend') {
          steps {
            bat "docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% frontend"
            bat """
              trivy image ^
                --cache-dir "%USERPROFILE%\\.cache\\trivy" ^
                --scanners vuln ^
                --severity HIGH,CRITICAL ^
                %FRONTEND_IMAGE%:%BUILD_NUMBER%
            """
          }
        }
      }
    }

    stage('Push to Docker Hub') {
      steps {
        bat '''
          echo %DOCKERHUB_CREDS_PSW% | docker login -u %DOCKERHUB_CREDS_USR% --password-stdin
          docker push %BACKEND_IMAGE%:%BUILD_NUMBER%
          docker push %FRONTEND_IMAGE%:%BUILD_NUMBER%
        '''
      }
    }

    stage('Generate Namespace') {
      steps {
        script {
          def prId = env.CHANGE_ID?.trim() ?: params.MANUAL_PR_ID?.trim()

          if (prId && prId != '') {
            env.NAMESPACE = "pr-${prId}-${env.BUILD_NUMBER}"
            env.RESOLVED_PR_ID = prId.toInteger()
            echo "PR détectée → namespace: ${env.NAMESPACE}"
          } else {
            env.NAMESPACE = "dev"
            env.RESOLVED_PR_ID = ''
            echo "Pas de PR → namespace: ${env.NAMESPACE}"
          }
        }
      }
    }


    stage('Debug K8s Access') {
      steps {
        withEnv(['KUBECONFIG=C:\\Program Files\\Jenkins\\Kube\\config']) {
          bat 'kubectl config use-context minikube'
          bat 'kubectl get nodes'
        }
      }
    }

    stage('Terraform Apply') {
      steps {
        dir('terraform') {
          withEnv(['KUBECONFIG=C:\\Program Files\\Jenkins\\Kube\\config']) {
            bat """
              if not exist states mkdir states
              terraform init -reconfigure ^
                -backend-config="path=states/${env.NAMESPACE}.tfstate"
              terraform apply -auto-approve ^
                -var="namespace=${env.NAMESPACE}" ^
                -var="image_tag=${env.BUILD_NUMBER}" ^
                -var="kubeconfig_path=C:\\Program Files\\Jenkins\\Kube\\config"
            """
          }
        }
      }
    }

    stage('Minikube deployment') {
      steps {
        dir('ArgoCD/manifests') {
          withEnv(['KUBECONFIG=C:\\Program Files\\Jenkins\\Kube\\config']) {
            bat """
              powershell -Command "(Get-Content task-manager-backend.yaml) -replace 'IMAGE_TAG', '${env.BUILD_NUMBER}' | Set-Content task-manager-backend.yaml"
              powershell -Command "(Get-Content task-manager-frontend.yaml) -replace 'IMAGE_TAG', '${env.BUILD_NUMBER}' | Set-Content task-manager-frontend.yaml"
              powershell -Command "(Get-Content task-manager-network-policy.yaml) -replace '__NAMESPACE__', '${env.NAMESPACE}' | Set-Content task-manager-network-policy.yaml"
              powershell -Command "(Get-Content task-manager-resource-quota.yaml) -replace '__NAMESPACE__', '${env.NAMESPACE}' | Set-Content task-manager-resource-quota.yaml"
              kubectl config use-context minikube
              kubectl apply -f . -n ${env.NAMESPACE}
            """
          }
        }
      }
    }

    stage('Trigger PR Cleanup') {
    steps {
        script {
            def prId = env.CHANGE_ID?.trim() ?: params.MANUAL_PR_ID?.trim()
            def namespace = "pr-${prId}-${env.BUILD_NUMBER}"

            try {
                timeout(time: 30, unit: 'MINUTES') {
                    userInput = input(
                        message: "Veux-tu lancer le Cleanup du namespace ${namespace} ?",
                        ok: 'Oui, lancer le Cleanup'
                    )
                }

                def cleanupBuild = build job: 'PR-Cleanup',
                wait: false,
                parameters: [
                    string(name: 'PR_ID', value: prId),
                    string(name: 'NAMESPACE', value: namespace),
                    string(name: 'BUILD_NUMBER', value: "${env.BUILD_NUMBER}")
                ]

                echo "Cleanup job triggered: ${cleanupBuild?.number}"

            } catch (err) {
                echo " Cleanup ignoré (timeout ou annulé) → namespace ${namespace} conservé"
                currentBuild.result = 'SUCCESS'
            }
        }
    }
  }
}

  post {
    success {
      echo '========================================='
      echo 'Pipeline completed successfully!'
      echo '========================================='
    }
    failure {
      echo '========================================='
      echo 'Pipeline failed!'
      echo 'Check the logs above for error details.'
      echo '========================================='
    }
    always {
      echo 'Cleaning up...'
    }
  }
}