pipeline {
  agent any

  tools {
    jdk 'JDK17'
    maven 'Maven3'
    nodejs 'node18'
  }
  parameters {
    string(name: 'MANUAL_PR_ID', defaultValue: '', description: 'PR number to cleanup (classic pipeline only)')
    booleanParam(name: 'RUN_CLEANUP', defaultValue: false, description: 'Trigger PR environment cleanup')
    string(name: 'PR_TTL_MINUTES', defaultValue: '30', description: 'Durée de vie de l environnement PR en minutes')
  }
  environment {
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
    SONAR_PROJECT_KEY_BACKEND = 'backend-app'
    SONAR_PROJECT_KEY_FRONTEND = 'frontend-app'
    FRONTEND_IMAGE = 'mohamed510/task-manager-frontend'
    BACKEND_IMAGE = 'mohamed510/task-manager-backend'
    NAMESPACE = 'task-manager-dev'
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
          '''
        }
      }
    }

    stage('SonarQube Analysis') {
      steps {
        withSonarQubeEnv('SonarQube') {
          dir('backend') {
            bat '''
              mvn sonar:sonar ^
              -Dsonar.projectKey=%SONAR_PROJECT_KEY_BACKEND%
            '''
          }
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        bat '''
          docker build -t %BACKEND_IMAGE%:%BUILD_NUMBER% backend
          docker build -t %FRONTEND_IMAGE%:%BUILD_NUMBER% frontend
        '''
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
            env.NAMESPACE = "pr-${prId}"
            env.RESOLVED_PR_ID = prId
            echo "✅ PR détectée → namespace: ${env.NAMESPACE}"
          } else {
            env.NAMESPACE = "task-manager-dev"
            env.RESOLVED_PR_ID = ''
            echo "✅ Pas de PR → namespace: ${env.NAMESPACE}"
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
      when {
        expression { env.RESOLVED_PR_ID == '' }
      }
      steps {
        dir('terraform') {
          withEnv(['KUBECONFIG=C:\\Program Files\\Jenkins\\Kube\\config']) {
            bat """
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
              kubectl config use-context minikube
              kubectl apply -f . -n ${env.NAMESPACE}
            """
          }
        }
      }
    }

    stage('Schedule PR Cleanup') {
      when {
        anyOf {
          expression { env.CHANGE_ID != null }
          expression { params.RUN_CLEANUP == true && params.MANUAL_PR_ID?.trim() != '' }
        }
      }
      steps {
        script {
          def ttl = params.PR_TTL_MINUTES.toInteger()
          def prId = env.CHANGE_ID?.trim() ?: params.MANUAL_PR_ID?.trim()
          echo "⏳ Destruction de pr-${prId} dans ${ttl} minutes..."
          sleep(time: ttl, unit: 'MINUTES')
          echo "🗑️ Destruction de pr-${prId}..."
        }
        dir('terraform') {
          withEnv(['KUBECONFIG=C:\\Program Files\\Jenkins\\Kube\\config']) {
            script {
              def prId = env.CHANGE_ID?.trim() ?: params.MANUAL_PR_ID?.trim()
              bat """
                terraform init -reconfigure ^
                  -backend-config="path=states/pr-${prId}.tfstate"
                terraform destroy -auto-approve ^
                  -var="namespace=pr-${prId}" ^
                  -var="image_tag=${env.BUILD_NUMBER}" ^
                  -var="kubeconfig_path=C:\\Program Files\\Jenkins\\Kube\\config"
              """
            }
          }
        }
      }
    }
}

  post {
    success {
      echo '========================================='
      echo 'Pipeline completed successfully! ✅'
      echo '========================================='
    }
    failure {
      echo '========================================='
      echo 'Pipeline failed! ❌'
      echo 'Check the logs above for error details.'
      echo '========================================='
    }
    always {
      echo 'Cleaning up...'
    }
  }
}