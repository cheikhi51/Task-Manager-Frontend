pipeline {
  agent any

  tools {
    jdk 'JDK17'
    maven 'Maven3'
    nodejs 'node18'
  }

  environment {
    DOCKERHUB_CREDS = credentials('dockerhub-creds')
    SONAR_PROJECT_KEY_BACKEND = 'backend-app'
    SONAR_PROJECT_KEY_FRONTEND = 'frontend-app'
    FRONTEND_IMAGE = 'mohamed510/task-manager-frontend'
    BACKEND_IMAGE = 'mohamed510/task-manager-backend'
    NAMESPACE = 'default'
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
          if (env.CHANGE_ID) {
            env.NAMESPACE = "pr-${env.CHANGE_ID}"
          } else {
            env.NAMESPACE = "task-manager-dev"
          }
        }
      }
    }

    stage('Terraform Apply') {
      when {
        expression { env.CHANGE_ID == null }
      }
      steps {
        dir('terraform') {
          bat """
            terraform init
            terraform apply -auto-approve -var="namespace=%NAMESPACE%"
          """
        }
      }
    }

    stage('Update GitOps Repo') {
      steps {
        dir('ArgoCD') {
          withCredentials([usernamePassword(
            credentialsId: 'git-creds',
            usernameVariable: 'GIT_USERNAME',
            passwordVariable: 'GIT_PASSWORD'
          )]) {

            bat '''
              git config user.email "ci@jenkins.com"
              git config user.name "Jenkins CI"

              REM Update backend image
              powershell -Command "(Get-Content task-manager-backend.yaml) -replace 'image: .*', 'image: ${BACKEND_IMAGE}:${BUILD_NUMBER}' | Set-Content task-manager-backend.yaml"

              REM Update frontend image
              powershell -Command "(Get-Content task-manager-frontend.yaml) -replace 'image: .*', 'image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}' | Set-Content task-manager-frontend.yaml"
              
              git add .
              git diff --cached --quiet || git commit -m "Update image to build ${BUILD_NUMBER}"
              git push https://%GIT_USERNAME%:%GIT_PASSWORD%@github.com/cheikhi51/Task-Manager-K8s.git HEAD:main
            '''
          }
        }
      }
    }

    stage('Cleanup PR Environment') {
      when {
        expression { env.CHANGE_ID && env.CHANGE_TARGET == 'closed' }
      }
      steps {
        dir('terraform') {
          bat """
            terraform destroy -auto-approve -var="namespace=pr-${env.CHANGE_ID}"
          """
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