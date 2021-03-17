pipeline {
    agent any
    environment {
        branch_name = ''
        short_commit = ''
        eventsarchive = ''
        CLUSTER='hero-datacenter'
        NAMESPACE='hero-dev'
    }
    stages {
        stage('build docker image') {
            steps {
                script {
                    def scmVars = checkout scm
                    branch_name = scmVars.GIT_BRANCH
                    short_commit = scmVars.GIT_COMMIT.substring(0, 8)
                    eventsarchive = docker.build("nexus.internal.hero.com/hero/eventsarchive:${short_commit}")
                }
            }
        }

        stage('run test in docker container') {
            steps {
                script {
                    eventsarchive.inside() {
                        sh 'npm test'
                    }
                }
            }
        }

        stage('push docker image') {
            steps {
                script {
                    if (branch_name == 'origin/master') {
                        recImage.push('latest')
                    }
                    eventsarchive.push()
                }
            }
        }

        stage('deploy to k8s dev cluster') {
            steps {
                script {
                    if (branch_name == 'origin/master') {
                        sh "kubectl --context $CLUSTER --namespace=$NAMESPACE set image deployment/eventsarchive eventsarchive=${recImage.imageName()}"
                    }
                }
            }
        }
    }

    post {
        failure {
            mail to: 'myself@hero.com',
                subject: "Failed Pipeline: ${currentBuild.fullDisplayName}",
                body: "Something is wrong with ${env.BUILD_URL}"
        }
    }
}
